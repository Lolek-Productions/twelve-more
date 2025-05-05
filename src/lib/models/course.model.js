import mongoose from 'mongoose';

// Quiz question schema for quiz modules
const quizQuestionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    answer: { type: String, required: true },
    explanation: { type: String }, // Optional explanation for the answer
  },
  { _id: false }
);

// Module schema for course modules
const moduleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: { type: String, enum: ['video', 'quiz', 'text'], required: true },
    // For quizzes, content is an array of questions; otherwise, it's a string or object.
    content: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    order: { type: Number },
  },
  { _id: false }
);

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    visibility: {
      type: String,
      default: 'public',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
    },
    modules: [moduleSchema]
  },
  { timestamps: true }
);

const Course = mongoose.models?.Course || mongoose.model('Course', courseSchema);

export default Course;
