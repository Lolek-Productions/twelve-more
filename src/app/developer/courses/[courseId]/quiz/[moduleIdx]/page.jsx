"use client";

import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { getCourseById, updateCourse } from "@/lib/actions/course"
import QuizEditor from "../../quiz-editor.jsx"
import { useApiToast } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export default function QuizEditorPage() {
  const { showResponseToast, showErrorToast } = useApiToast();
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId;
  const moduleIdx = parseInt(params.moduleIdx, 10);

  const [module, setModule] = useState(null);
  const [courseName, setCourseName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchModule() {
      setLoading(true);
      try {
        const data = await getCourseById(courseId);
        const mod = data.course?.modules?.[moduleIdx];
        if (!mod) throw new Error("Module not found");
        setModule(mod);
        setCourseName(data.course?.name || "");
      } catch (err) {
        setError("Failed to load module");
      } finally {
        setLoading(false);
      }
    }
    if (!isNaN(moduleIdx)) fetchModule();
  }, [courseId, moduleIdx]);

  async function handleSave({ title, description, questions }) {
    try {
      // Save the quiz questions, title, and description to the module
      const data = await getCourseById(courseId);
      const modules = data.course.modules || [];
      modules[moduleIdx] = {
        ...modules[moduleIdx],
        title,
        description,
        content: questions
      };
      const result = await updateCourse(courseId, { modules });
      showResponseToast(result);
    } catch (err) {
      setError("Failed to save quiz");
      showErrorToast(err);
    }
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!module) return <div>Module not found.</div>;
  if (module.type !== "quiz") return <div>Not a quiz module.</div>;

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Button
        asChild
        variant="ghost"
        className="mb-6"
      >
        <a href={`/developer/courses/${courseId}`}>
          ← Back to Course
        </a>
      </Button>
      <div className="mb-2 text-gray-700 text-lg font-semibold">
        {courseName && (
          <>Course: <span className="font-bold">{courseName}</span></>
        )}
      </div>
      <h1 className="text-2xl font-bold mb-4">Edit Quiz: {module.title}</h1>
      <QuizEditor
        value={{
          title: module.title || "",
          description: module.description || "",
          questions: module.content || []
        }}
        onChange={handleSave}
      />
    </div>
  );
}
