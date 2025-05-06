"use client"

import React, { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  getCourseById,
  updateCourse
} from "@/lib/actions/course"
import { Button } from "@/components/ui/button"
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import QuizEditor from "./quiz-editor.jsx"
import { Input } from "@/components/ui/input"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useApiToast } from "@/lib/utils"

// Zod schema for module editing
const moduleFormSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  type: z.enum(["video", "text", "quiz"]),
  content: z.string().optional(), // for video/text; quiz will be handled separately
})

function CourseMetaForm({ course, onUpdated }) {
  const [form, setForm] = useState({ name: course.name, description: course.description });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { showResponseToast, showErrorToast } = useApiToast();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await updateCourse(course._id, form);
      if (result && result.success && result.course) {
        onUpdated(result.course);
      }
      showResponseToast(result);
    } catch (err) {
      setError("Failed to update course");
      showErrorToast(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {course && (
        <div className="mb-1 text-gray-700 text-lg font-semibold">
          Course: <span className="font-bold">{course.name}</span>
        </div>
      )}
      <form onSubmit={handleSubmit} className="mb-8 bg-gray-50 border rounded-lg p-6 flex flex-col gap-4 max-w-xl">
        <div className="flex flex-col gap-1">
          <label className="font-semibold mb-1" htmlFor="course-name">Course Name</label>
          <input
            id="course-name"
            className="border rounded px-2 py-1"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            required
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-semibold mb-1" htmlFor="course-description">Description</label>
          <textarea
            id="course-description"
            className="border rounded px-2 py-1 min-h-[60px]"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          />
        </div>
        <div className="flex gap-2 items-center">
          <Button type="submit" disabled={loading}>Save</Button>
          {error && <span className="text-red-600 text-sm">{error}</span>}
        </div>
      </form>
    </>
  );
}

export default function DeveloperCourseModulesPage() {
  const params = useParams()
  const courseId = params.courseId
  const [course, setCourse] = useState(null)
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingModule, setEditingModule] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  async function fetchCourse() {
    setLoading(true)
    try {
      const data = await getCourseById(courseId)
      setCourse(data.course)
      setModules(data.course.modules || [])
    } catch (err) {
      setError("Failed to load course")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (courseId) fetchCourse()
  }, [courseId])

  function handleEditModule(mod, idx) {
    setEditingModule({ ...mod, idx })
    setDialogOpen(true)
  }

  function handleNewModule() {
    setEditingModule({ title: "", type: "text", content: "", idx: null })
    setDialogOpen(true)
  }

  async function handleDeleteModule(idx) {
    if (!window.confirm("Are you sure?")) return;
    // Remove the module at idx and update the course
    const updatedModules = modules.filter((_, i) => i !== idx);
    await updateCourse(courseId, { modules: updatedModules });
    const data = await getCourseById(courseId);
    setModules(data.course.modules || []);
  }

  async function handleSubmit(values) {
    let updatedModules;
    if (!editingModule || editingModule.idx === null || editingModule.idx === undefined) {
      // Add new module
      updatedModules = [...modules, values];
    } else {
      // Edit existing module
      updatedModules = modules.map((mod, i) => i === editingModule.idx ? values : mod);
    }
    await updateCourse(courseId, { modules: updatedModules });
    setDialogOpen(false);
    const data = await getCourseById(courseId);
    setModules(data.course.modules || []);
    toast({ title: "Module saved successfully!", variant: "success" });
  }

  const form = useForm({
    resolver: zodResolver(moduleFormSchema),
    defaultValues: editingModule || { title: "", type: "text", content: "" },
    mode: "onChange",
  })

  useEffect(() => {
    if (editingModule) {
      form.reset(editingModule)
    }
    // eslint-disable-next-line
  }, [editingModule])

  return (
    <div className="max-w-3xl mx-auto px-8">
      <div className="mb-4">
        <Link href="/developer/courses" passHref legacyBehavior>
          <Button asChild variant="outline">
            <a>&larr; Back to Courses</a>
          </Button>
        </Link>
      </div>

      {course && (
        <div>
          <h1 className="text-2xl font-bold mb-2">Edit Course</h1>
        </div>
      )}
      <div className="text-red-600 mb-4">{error}</div>
      {/* Course name/description edit form */}
      {course && (
        <CourseMetaForm course={course} onUpdated={setCourse} />
      )}
      
      <ul className="divide-y">
        {modules.map((mod, idx) => (
          <li key={mod.id || idx} className="py-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold">{mod.title}</div>
                <div className="text-gray-500 text-sm">Type: {mod.type}</div>
              </div>
              <div className="flex gap-2 items-center">
                {mod.type === 'quiz' ? (
                  <Button asChild variant="outline">
                    <a
                      href={`/developer/courses/${courseId}/quiz/${idx}`}
                    >
                      Edit
                    </a>
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => handleEditModule(mod, idx)}>Edit</Button>
                )}
                <Button variant="destructive" onClick={() => handleDeleteModule(idx)}>Delete</Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <div className="mt-10 max-w-lg mx-auto bg-white border border-gray-200 rounded-lg shadow-lg p-6">
          <DialogHeader>
            <DialogTitle>
  {editingModule && editingModule.idx !== null
    ? `Edit Module: ${editingModule.title || '(Untitled)'} (${editingModule.type || 'unknown'})`
    : 'Add Module'}
</DialogTitle>
<DialogDescription>
  {editingModule && editingModule.idx !== null
    ? 'Edit the module details below.'
    : 'Add a new module to this course.'}
</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="flex flex-col gap-6 mt-4"
            >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-0.5">
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
  <SelectTrigger className="w-full">
    <SelectValue placeholder="Select type" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="video">Video</SelectItem>
    <SelectItem value="text">Text</SelectItem>
    <SelectItem value="quiz">Quiz</SelectItem>
  </SelectContent>
</Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Content field for video/text, QuizEditor for quiz */}
            {form.watch('type') === 'quiz' 
              ? (
                <div className="flex flex-col gap-2">
                  <FormLabel>Quiz Questions</FormLabel>
                  <a
                    href={`/developer/courses/${courseId}/quiz/${editingModule?.idx ?? ''}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Edit Quiz Questions
                  </a>
                  {Array.isArray(form.getValues('content')) && form.getValues('content').length > 0 && (
                    <div className="mt-2 text-xs text-gray-500">{form.getValues('content').length} questions saved</div>
                  )}
                </div>
              )
              : (
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-0.5">
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <textarea {...field} className="border rounded px-2 py-1 min-h-[80px] w-full" />
                      </FormControl>
                      <FormDescription>
                        For video, enter the embed URL. For text, enter the content.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            <div className="flex gap-2">
              <Button type="submit">Save</Button>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Dialog>
  </div>
  )
}
