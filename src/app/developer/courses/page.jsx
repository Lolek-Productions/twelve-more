import React from "react";
import { getAllCourses } from "@/lib/actions/course";
import CoursesClient from "./CoursesClient";

export default async function DeveloperCoursesPage() {
  const { courses = [] } = await getAllCourses();
  return <CoursesClient initialCourses={courses} />;
}

