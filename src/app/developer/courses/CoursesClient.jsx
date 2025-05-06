"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { updateCourse, deleteCourse, createCourse } from "@/lib/actions/course";

export default function CoursesClient({ initialCourses }) {
  const [courses, setCourses] = useState(initialCourses || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);
  const [form, setForm] = useState({ name: "", description: "" });

  function handleEdit(course) {
    setEditingCourse(course);
    setForm({ name: course.name, description: course.description });
  }

  function handleCancel() {
    setEditingCourse(null);
    setForm({ name: "", description: "" });
  }

  async function handleSave() {
    if (!editingCourse) return;
    setLoading(true);
    await updateCourse(editingCourse._id, form);
    setEditingCourse(null);
    setForm({ name: "", description: "" });
    await refreshCourses();
    setLoading(false);
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure?")) return;
    setLoading(true);
    await deleteCourse(id);
    await refreshCourses();
    setLoading(false);
  }

  async function handleCreate() {
    setLoading(true);
    await createCourse(form);
    setForm({ name: "", description: "" });
    await refreshCourses();
    setLoading(false);
  }

  async function refreshCourses() {
    // Re-fetch from the server via location reload (SSR revalidation) or API route if you want live updates
    // For now, just reload the page for simplicity
    window.location.reload();
  }

  return (
    <div className="max-w-3xl mx-auto p-8">

      <h1 className="text-2xl font-bold mb-6">Add Course</h1>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <section className="mb-12 pb-8 border-b border-gray-200">
  <h2 className="font-semibold mb-2">Create New Course</h2>
  <form
    onSubmit={e => { e.preventDefault(); handleCreate(); }}
    className="flex flex-col gap-4 mb-2"
  >
    <div className="border rounded-lg p-4 bg-white flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="course-name" className="block text-sm font-medium mb-0.5">Course Name</label>
        <Input
          id="course-name"
          placeholder="Course Name"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          required
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="course-description" className="block text-sm font-medium mb-0.5">Description</label>
        <Input
          id="course-description"
          placeholder="Description"
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          required
        />
      </div>
      <Button type="submit" disabled={loading}>Create</Button>
    </div>
  </form>
</section>
      <div className="my-12" />
      <h2 className="text-2xl font-bold mb-2">Existing Courses</h2>

      {loading ? (
        <div>Loading...</div>
      ) : courses.length === 0 ? (
        <div className="text-gray-500">No courses found.</div>
      ) : (
        <ul className="divide-y">
          {courses.map(course => (
            <li key={course._id} className="py-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold">{course.name}</div>
                  <div className="text-gray-600 text-sm">{course.description}</div>
                </div>
                <div className="flex gap-2">
                  <Button asChild variant="outline">
  <Link href={`/developer/courses/${course._id}`}>Edit</Link>
</Button>
                  <Button variant="destructive" onClick={() => handleDelete(course._id)} disabled={loading}>Delete</Button>
                </div>
              </div>
              {editingCourse && editingCourse._id === course._id && (
                <div className="mt-2 flex flex-col gap-2 bg-gray-50 p-2 rounded">
                  <input
                    className="border rounded px-2 py-1"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  />
                  <input
                    className="border rounded px-2 py-1"
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleSave} disabled={loading}>Save</Button>
                    <Button variant="secondary" onClick={handleCancel} disabled={loading}>Cancel</Button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
