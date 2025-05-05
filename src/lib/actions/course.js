"use server";
import Course from "@/lib/models/course.model";
import { connect } from "@/lib/mongodb/mongoose.js";

export async function getCourseById(courseId) {
  await connect();
  if (!courseId) return { success: false, error: "No courseId provided" };
  const course = await Course.findById(courseId).lean();
  if (!course) return { success: false, error: "Course not found" };

  return {
    success: true,
    course: {
      name: course.name,
      modules: course.modules,
      description: course.description,
    }
  };
}
