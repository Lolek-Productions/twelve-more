import Course from '@/lib/models/course.model';
import { connect } from '@/lib/mongodb/mongoose.js';
import { NextResponse } from 'next/server';

export async function GET(req) {
  const url = new URL(req.url);
  const courseId = url.searchParams.get('id');
  await connect();
  if (!courseId) {
    return NextResponse.json({ success: false, error: 'No courseId provided' }, { status: 400 });
  }
  const course = await Course.findById(courseId).lean();
  if (!course) {
    return NextResponse.json({ success: false, error: 'Course not found' }, { status: 404 });
  }
  return NextResponse.json({
    success: true,
    course: {
      name: course.name,
      modules: course.modules,
      description: course.description,
    }
  });
}
