"use server";
import Course from "@/lib/models/course.model";
import { connect } from "@/lib/mongodb/mongoose.js";

export async function getAllCourses() {
  await connect();
  try {
    const courses = await Course.find({}, { name: 1, description: 1, modules: 1 }).lean();
    const plainCourses = courses.map(course => ({
      _id: course._id.toString(),
      name: course.name,
      description: course.description,
      modules: course.modules
    }));
    console.log('[getAllCourses] Returning', plainCourses.length, 'courses:', plainCourses);
    return { success: true, courses: plainCourses };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function createCourse({ name, description }) {
  await connect();
  try {
    const course = await Course.create({ name, description, modules: [] });
    console.log('[createCourse] Created course:', course);
    return { success: true, course: { _id: course._id.toString(), name: course.name, description: course.description, modules: course.modules } };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function updateCourse(id, data) {
  await connect();
  try {
    const course = await Course.findByIdAndUpdate(id, data, { new: true, lean: true });
    if (!course) return { success: false, error: "Course not found" };
    return { success: true, course: {
      _id: course._id.toString(),
      name: course.name,
      description: course.description,
      modules: course.modules
    }};
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function deleteCourse(id) {
  await connect();
  try {
    const result = await Course.findByIdAndDelete(id);
    if (!result) return { success: false, error: "Course not found" };
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getCourseById(courseId) {
  await connect();
  if (!courseId) return { success: false, error: "No courseId provided" };
  const course = await Course.findById(courseId).lean();
  if (!course) return { success: false, error: "Course not found" };

  return {
    success: true,
    course: {
      _id: course._id.toString(),
      name: course.name,
      modules: course.modules,
      description: course.description,
    }
  };
}
