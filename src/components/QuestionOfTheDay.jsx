'use client';

import { useEffect, useState } from "react";
import { useAppUser } from "@/hooks/useAppUser.js";
import moment from "moment/moment";
import { HiLightBulb } from 'react-icons/hi';
import Link from "next/link";

// Helper function to get question of the day
const getQuestionOfTheDay = (date) => {
  const questions = [
    {
      date: "2025-04-06",
      question: "Tell a story about a time when God led you through a personal desert or dry season—and something new, unexpected, or life-giving came from it?",
      description: "From today's reading: Isaiah 43:16-21 – “See, I am doing something new!”"
    },
    {
      date: "2025-04-07",
      question: "Reflect on a time when you faced unjust accusations or misunderstandings. How did you respond, and what did you learn from that experience?",
      description: "From today's reading: Daniel 13:1-9, 15-17, 19-30, 33-62 – The story of Susanna, who was falsely accused but ultimately vindicated."
    },
    {
      date: "2025-04-08",
      question: "Have you ever experienced a situation where you felt overwhelmed by challenges, similar to the Israelites in the desert? How did you find healing or relief?",
      description: "From today's reading: Numbers 21:4-9 – The Israelites' impatience in the desert and the bronze serpent as a means of healing."
    },
    {
      date: "2025-04-09",
      question: "Can you share an experience where standing firm in your beliefs was difficult? What gave you the strength to remain steadfast?",
      description: "From today's reading: Daniel 3:14-20, 91-92, 95 – Shadrach, Meshach, and Abednego's unwavering faith in the face of the fiery furnace."
    },
    {
      date: "2025-04-10",
      question: "Reflect on a promise or commitment you've made. How have you upheld it, and what challenges have you faced in remaining faithful to it?",
      description: "From today's reading: Genesis 17:3-9 – God's covenant with Abraham and the call to remain faithful."
    },
    {
      date: "2025-04-11",
      question: "Have you ever felt betrayed or opposed by those close to you? How did you cope with the situation, and what insights did you gain?",
      description: "From today's reading: Jeremiah 20:10-13 – Jeremiah's lament about being denounced by those around him."
    },
    {
      date: "2025-04-12",
      question: "Share about a time when you felt distant or scattered in your spiritual journey. What led you back to a sense of unity and peace?",
      description: "From today's reading: Ezekiel 37:21-28 – God's promise to gather and restore the people of Israel."
    }
  ];

  // Find question matching the given date
  const matchingQuestion = questions.find(q => q.date === date);

  // Fallback for dates without a specific question
  if (!matchingQuestion) {
    // Use current date to pick a fallback question
    const fallbackQuestions = [
      {
        question: "What's something interesting you learned recently?",
        description: "Share knowledge and insights with your community."
      },
      {
        question: "What are you looking forward to this week?",
        description: "Goals, events, or simple pleasures - what's on your horizon?"
      },
      {
        question: "What's a recent win you'd like to celebrate?",
        description: "Take a moment to acknowledge your achievements."
      }
    ];

    const dayOfYear = moment(date).dayOfYear();
    const fallbackIndex = dayOfYear % fallbackQuestions.length;
    return fallbackQuestions[fallbackIndex];
  }

  return matchingQuestion;
};

export default function QuestionOfTheDay() {
  const { appUser } = useAppUser();
  const [currentDate, setCurrentDate] = useState("");
  const [dailyQuestion, setDailyQuestion] = useState({ question: "", description: "" });

  useEffect(() => {
    // Get today's date in YYYY-MM-DD format
    const today = moment().format("YYYY-MM-DD");
    setCurrentDate(today);

    // Get question for today
    const questionData = getQuestionOfTheDay(today);
    setDailyQuestion(questionData);
  }, []);

  return (
    <div className="mt-3  text-gray-700  bg-gray-100 rounded-xl py-3">
      {/* Header */}
      <div className="px-4  flex items-center">
        <h3 className="font-bold text-gray-900 text-lg">Question of the Day</h3>
      </div>

      {/* Content */}
      <div className="px-4 space-y-2">
        <p className="font-medium text-gray-800">{dailyQuestion.question}</p>
        <p className="text-gray-600 text-sm">{dailyQuestion.description}</p>
        <div className="pt-2">
            <div className={'text-xs font-bold'}>Post to your 12</div>
        </div>
      </div>
    </div>
  );
}