"use client";
import React, { useState, useEffect } from "react";
import { useMainContext, MainContextProvider } from "@/components/MainContextProvider.jsx";
import { getCourseProgress, updateCourseProgress } from "@/lib/actions/user";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Toaster } from "@/components/ui/toaster";

export default function CoursePage() {
  const params = useParams();
  const courseId = params.courseId;

  return (
    <MainContextProvider>
      <CoursePageInner courseId={courseId} />
      <Toaster />
    </MainContextProvider>
  );
}

function CoursePageInner({ courseId }) {
  const [sidebarOpen, setSidebarOpen] = useState(false); // For mobile drawer
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [completed, setCompleted] = useState({}); // {moduleIndex: true/false}
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({}); // {moduleIdx: {qIdx: answer}}
  const [quizSubmitted, setQuizSubmitted] = useState({}); // {moduleIdx: true/false}

  const { appUser } = useMainContext();

  useEffect(() => {
    if (!courseId || !appUser?.id) {
      setLoading(false);
      return;
    }
    async function fetchCourseData() {
      setLoading(true);
      try {
        const constCourseId = '6818cc910e114382dd33c2d0';
        // 1. Fetch course data
        const data = await (await import("@/lib/actions/course")).getCourseById(constCourseId);
        // 2. Fetch user progress (server action)
        let progress = null;
        try {
          progress = await getCourseProgress(appUser.id, constCourseId);
        } catch {}
        if (!data.success) {
          setError(data.error || 'Course not found');
        } else {
          setCourse(data.course);
          setModules(data.course.modules || []);
          // Set completed modules from progress
          let initialCompleted = {};
          if (progress && progress.success && Array.isArray(progress.courseProgress?.completedModules)) {
            progress.courseProgress.completedModules.forEach(idx => initialCompleted[idx] = true);
          }
          setCompleted(initialCompleted);
          // Find first incomplete module
          const mods = data.course.modules || [];
          let firstIncomplete = 0;
          for (let i = 0; i < mods.length; i++) {
            if (!initialCompleted[i]) {
              firstIncomplete = i;
              break;
            }
          }
          setSelectedIndex(firstIncomplete);
        }
      } catch (err) {
        setError('Failed to fetch course data');
      } finally {
        setLoading(false);
      }
    }
    fetchCourseData();
  }, [courseId, appUser?.id]);

  // Prefill quiz answers with correct answers if quiz is completed
  useEffect(() => {
    if (!modules.length) return;
    setQuizAnswers((prev) => {
      let updated = { ...prev };
      modules.forEach((mod, idx) => {
        if (mod.type === 'quiz' && completed[idx] && (!prev[idx] || Object.keys(prev[idx]).length === 0)) {
          const questions = Array.isArray(mod.content) ? mod.content : [];
          updated[idx] = {};
          questions.forEach((q, qIdx) => {
            updated[idx][qIdx] = q.answer;
          });
        }
      });
      return updated;
    });
    setQuizSubmitted((prev) => {
      let updated = { ...prev };
      modules.forEach((mod, idx) => {
        if (mod.type === 'quiz' && completed[idx] && !prev[idx]) {
          updated[idx] = true;
        }
      });
      return updated;
    });
  }, [modules, completed]);

  // Helper: update progress in backend
  async function updateProgressBackend(newCompleted) {
    if (!appUser?.id) return;
    const completedIndices = Object.keys(newCompleted).filter(k => newCompleted[k]).map(Number);
    await updateCourseProgress(appUser.id, courseId, completedIndices);
  }

  const handleModuleClick = (idx) => {
    setSelectedIndex(idx);
  };

  const handleComplete = async (idx) => {
    setCompleted((prev) => {
      const updated = { ...prev, [idx]: true };
      setTimeout(() => {
        updateProgressBackend(updated);
      }, 0);
      return updated;
    });
  };

  // For quizzes: handle answer change
  const handleQuizAnswer = (moduleIdx, qIdx, answer) => {
    setQuizAnswers((prev) => ({
      ...prev,
      [moduleIdx]: { ...(prev[moduleIdx] || {}), [qIdx]: answer },
    }));
  };

  // For quizzes: handle submit
  const handleQuizSubmit = (moduleIdx, questions) => {
    setQuizSubmitted((prev) => ({ ...prev, [moduleIdx]: true }));
    // Mark as complete if all answers are correct
    const userAnswers = quizAnswers[moduleIdx] || {};
    const allCorrect = questions.every((q, i) => userAnswers[i] === q.answer);
    if (allCorrect) {
      handleComplete(moduleIdx);
    }
  };

  // Render main content based on module type
  const renderContent = (mod, idx) => {
    if (!mod) return null;
    if (mod.type === "video") {
      return (
        <div className="text-center">
          <iframe
            className="mx-auto w-full max-w-2xl aspect-video rounded shadow"
            src={mod.content}
            title="Video module"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
          {!!completed && !completed[idx] && (
            <button
              onClick={() => handleComplete(idx)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Mark as Complete
            </button>
          )}
          {idx < modules.length - 1 && (
            <button
              onClick={() => setSelectedIndex(idx + 1)}
              className="mt-4 ml-4 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Next
            </button>
          )}
        </div>
      );
    }
    if (mod.type === "quiz") {
      // Quiz module: content is array of questions
      const questions = Array.isArray(mod.content) ? mod.content : [];
      const answers = quizAnswers[idx] || {};
      const submitted = quizSubmitted[idx];
      return (
        <div>
          {questions.map((q, qIdx) => (
            <div key={qIdx} className="mb-5 p-3 border border-gray-200 rounded-lg">
              <div className="mb-2 font-medium">{q.question}</div>
              <div className="flex flex-col gap-2">
                {Array.isArray(q.options) && q.options.map((choice, cIdx) => {
                  const isQuizComplete = !!completed[idx] && submitted;
                  const isCorrect = q.answer === choice;
                  let checked, disabled, highlightClass;
                  if (isQuizComplete) {
                    checked = isCorrect;
                    disabled = true;
                    highlightClass = isCorrect ? 'bg-green-100 font-semibold' : '';
                  } else {
                    checked = answers[qIdx] === choice;
                    disabled = submitted;
                    highlightClass = '';
                  }
                  return (
                    <label key={cIdx} className={`flex items-center gap-2 cursor-pointer rounded px-1 ${highlightClass}`}>
                      <input
                        type="radio"
                        name={`quiz-${idx}-q-${qIdx}`}
                        value={choice}
                        checked={checked}
                        disabled={disabled}
                        onChange={() => handleQuizAnswer(idx, qIdx, choice)}
                        className="form-radio text-blue-600 h-4 w-4"
                      />
                      <span className="text-gray-800">{choice}</span>
                      {isQuizComplete && isCorrect && (
                        <span className="ml-2 text-green-700 text-xs font-bold">Correct answer</span>
                      )}
                    </label>
                  );
                })}
              </div>
              {submitted && !(!!completed[idx] && submitted) && (
                <div className={`mt-1 text-sm ${answers[qIdx] === q.answer ? 'text-green-600' : 'text-red-600'}`}>
                  {answers[qIdx] === q.answer ? 'Correct!' : 'Incorrect'}
                </div>
              )}
            
            </div>
          ))}
          {!submitted && !completed[idx] && (
            <button
              onClick={() => handleQuizSubmit(idx, questions)}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Submit Quiz
            </button>
          )}
          {submitted && (
            <div className="mt-2 flex flex-col gap-2">
              {questions.every((q, qIdx) => answers[qIdx] === q.answer) ? (
                <>
                  <span className="text-green-600">All answers correct! Marked as complete.</span>
                  <button
                    onClick={() => {
                      setQuizSubmitted(prev => ({ ...prev, [idx]: false }));
                      setQuizAnswers(prev => ({ ...prev, [idx]: {} }));
                      setCompleted(prev => {
                        const updated = { ...prev };
                        delete updated[idx];
                        return updated;
                      });
                    }}
                    className="mt-1 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-gray-800 w-max"
                  >
                    Retake Quiz
                  </button>
                </>
              ) : (
                <>
                  <span className="text-red-600">Some answers were incorrect. Try again!</span>
                  {!completed[idx] && (
                    <button
                      onClick={() => {
                        setQuizSubmitted(prev => ({ ...prev, [idx]: false }));
                        setQuizAnswers(prev => ({ ...prev, [idx]: {} }));
                      }}
                      className="mt-1 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-gray-800 w-max"
                    >
                      Retry Quiz
                    </button>
                  )}
                </>
              )}
            </div>
          )}
          {idx < modules.length - 1 && (
            <button
              onClick={() => setSelectedIndex(idx + 1)}
              className="ml-4 mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Next
            </button>
          )}
        </div>
      );
    }
    if (mod.type === "text") {
      return (
        <div>
          <div className="mb-4">{mod.content}</div>
          {!!completed && !completed[idx] && (
          <button onClick={() => handleComplete(idx)} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Mark as Complete</button>
        )}
        {idx < modules.length - 1 && (
          <button
            onClick={() => setSelectedIndex(idx + 1)}
            className="mt-4 ml-4 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Next
          </button>
        )}
        </div>
      );
    }
    return <div>Unsupported module type.</div>;
  };

  // Progress bar calculation
  const completedCount = Object.keys(completed).length;
  const totalModules = modules.length || 1;
  const percent = Math.round((completedCount / totalModules) * 100);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[80vh] text-lg text-gray-500">Loading...</div>;
  }
  if (error) {
    return <div className="flex items-center justify-center min-h-[80vh] text-lg text-red-600">{error}</div>;
  }
  return (
    <div className="min-h-[80vh] font-sans bg-white">
      {/* Mobile Header */}
      <div className="flex items-center h-14 border-b border-gray-200 px-4 bg-white sticky top-0 z-10 justify-between">
        <button
          className="text-2xl mr-2 bg-transparent border-0 cursor-pointer block"
          aria-label="Open sidebar"
          onClick={() => setSidebarOpen(true)}
        >
          <span aria-hidden="true">☰</span>
        </button>
        <span className="font-bold text-xl">Course Modules</span>
        <span className="w-8" />
      </div>

      {/* Sidebar Drawer (Mobile) */}
      {sidebarOpen && (
        <div
          className="fixed top-0 left-0 w-[80vw] max-w-xs h-full bg-gray-50 z-[100] shadow-lg p-6 transition-transform"
        >
          <button
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
            className="absolute top-4 right-4 text-2xl bg-transparent border-0 cursor-pointer"
          >
            ×
          </button>
          <div className="sidebar-home" style={{ marginBottom: 24 }}>
  <Link href="/home" className="flex items-center gap-2 mb-4" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }} onClick={() => setSidebarOpen(false)}>
    <Image src="/logo.png" alt="12More" width={36} height={36} style={{ borderRadius: 8 }} />
    <span style={{ fontWeight: 'bold', fontSize: 20, marginLeft: 10 }}>12More</span>
  </Link>
</div>
<div className="font-bold mb-4 text-lg">{course?.name}</div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {modules.map((mod, idx) => (
              <li
                key={mod.id || idx}
                className="flex items-center justify-between mb-3 cursor-pointer rounded px-2 py-2"
                style={{ background: selectedIndex === idx ? "#e9ecef" : "transparent" }}
                onClick={() => { handleModuleClick(idx); setSidebarOpen(false); }}
              >
                <span>{mod.title}</span>
                {completed[idx] ? (
                  <span className="flex items-center justify-center w-4 h-4 rounded-full bg-green-500 ml-2">
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 8.5L7 10.5L11 6.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                ) : (
                  <span className="flex items-center justify-center w-4 h-4 rounded-full bg-gray-300 ml-2" />
                )}
              </li>
            ))}
          </ul>
          {/* Progress Bar (mobile sidebar) */}
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-6 mb-2">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="text-sm text-gray-600 mb-2">{completedCount} of {totalModules} modules complete ({percent}%)</div>
        </div>
      )}
      {/* Overlay for sidebar drawer */}
      {sidebarOpen && (
        <div
          className="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-20 z-[99]"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Layout: Sidebar + Content (Desktop) */}
      <div className="flex min-h-[80vh]">
        {/* Sidebar (Desktop) */}
        <aside
          className="hidden md:flex flex-col min-h-screen w-60 bg-gray-50 border-r border-gray-200 p-6"
        >
          <div className="sidebar-home" style={{ marginBottom: 24 }}>
  <Link href="/home" className="flex items-center gap-2 mb-4" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
    <Image src="/logo.png" alt="12More" width={36} height={36} style={{ borderRadius: 8 }} />
    <span style={{ fontWeight: 'bold', fontSize: 20, marginLeft: 10 }}>12More</span>
  </Link>
</div>
<div className="font-bold mb-4 text-lg">{course?.name}</div>
          <ul className="list-none p-0 m-0">
            {modules.map((mod, idx) => (
              <li
                key={mod.id || idx}
                className={`flex items-center justify-between mb-3 cursor-pointer rounded px-2 py-2 ${selectedIndex === idx ? 'bg-gray-200' : ''}`}
                onClick={() => handleModuleClick(idx)}
              >
                <span>{mod.title}</span>
                {completed[idx] ? (
                  <span className="flex items-center justify-center w-4 h-4 rounded-full bg-green-500 ml-auto">
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 8.5L7 10.5L11 6.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                ) : (
                  <span className="flex items-center justify-center w-4 h-4 rounded-full bg-gray-300 ml-auto" />
                )}
              </li>
            ))}
          </ul>
          {/* Progress Bar (desktop sidebar) */}
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-6 mb-2">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="text-sm text-gray-600 mb-2">{completedCount} of {totalModules} modules complete ({percent}%)</div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 mb-6 pb-3">
            <div className="text-2xl font-bold">{modules[selectedIndex]?.title}</div>
            <div>
              {completed[selectedIndex] ? (
                <span className="text-green-600">Completed</span>
              ) : (
                <span className="text-gray-500">In Progress</span>
              )}
            </div>
          </div>
          {/* Dynamic Content */}
          <div>{renderContent(modules[selectedIndex], selectedIndex)}</div>
        </main>
      </div>

      {/* Responsive styles */}
      <style jsx global>{`
        @media (min-width: 768px) {
          .mobile-header,
          .sidebar-drawer,
          .sidebar-overlay {
            display: none !important;
          }
          .sidebar-desktop {
            display: flex !important;
          }
        }
        @media (max-width: 767px) {
          .sidebar-desktop {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
