'use client';

import { useEffect, useState } from "react";
import moment from "moment/moment";

// Questions array
const questions = [
  {
    date: "2025-04-06",
    communityType: null,
    question: "Tell a story about a time when God led you through a personal desert or dry season—and something new, unexpected, or life-giving came from it?",
    description: "From today's reading: Isaiah 43:16-21 – \"See, I am doing something new!\""
  },
  {
    date: "2025-04-06",
    communityType: 'welcoming',
    question: "What's something new or unexpected that you're looking forward to this year?",
    description: "From today's reading: Isaiah 43:16-21 – \"See, I am doing something new!\""
  },
  {
    date: "2025-04-06",
    communityType: 'leadership',
    question: "As a leader, how do you recognize when it's time to try a new approach? What helps you embrace change rather than clinging to established patterns?",
    description: "From today's reading: Isaiah 43:16-21 – \"See, I am doing something new!\""
  },

  // April 7th
  {
    date: "2025-04-07",
    communityType: null,
    question: "Reflect on a time when you faced unjust accusations or misunderstandings. How did you respond, and what did you learn from that experience?",
    description: "From today's reading: Daniel 13:1-9, 15-17, 19-30, 33-62 – The story of Susanna, who was falsely accused but ultimately vindicated."
  },
  {
    date: "2025-04-07",
    communityType: 'welcoming',
    question: "What's a good way to clear up a misunderstanding when it happens?",
    description: "From today's reading: Daniel 13:1-9, 15-17, 19-30, 33-62 – The story of Susanna, who was falsely accused but ultimately vindicated."
  },
  {
    date: "2025-04-07",
    communityType: 'leadership',
    question: "As a leader, how do you ensure people on your team are heard fairly when there are conflicting accounts or misunderstandings?",
    description: "From today's reading: Daniel 13:1-9, 15-17, 19-30, 33-62 – The story of Susanna, who was falsely accused but ultimately vindicated."
  },

  // April 8th
  {
    date: "2025-04-08",
    communityType: null,
    question: "Have you ever experienced a situation where you felt overwhelmed by challenges, similar to the Israelites in the desert? How did you find healing or relief?",
    description: "From today's reading: Numbers 21:4-9 – The Israelites' impatience in the desert and the bronze serpent as a means of healing."
  },
  {
    date: "2025-04-08",
    communityType: 'welcoming',
    question: "What's a simple activity that helps you relax after a busy day?",
    description: "From today's reading: Numbers 21:4-9 – The Israelites' impatience in the desert and the bronze serpent as a means of healing."
  },
  {
    date: "2025-04-08",
    communityType: 'leadership',
    question: "How do you help your team navigate periods of high stress or challenging circumstances? What approaches have you found effective?",
    description: "From today's reading: Numbers 21:4-9 – The Israelites' impatience in the desert and the bronze serpent as a means of healing."
  },

  // April 9th
  {
    date: "2025-04-09",
    communityType: null,
    question: "Can you share an experience where standing firm in your beliefs was difficult? What gave you the strength to remain steadfast?",
    description: "From today's reading: Daniel 3:14-20, 91-92, 95 – Shadrach, Meshach, and Abednego's unwavering faith in the face of the fiery furnace."
  },
  {
    date: "2025-04-09",
    communityType: 'welcoming',
    question: "If you could choose one positive quality you appreciate in others, what would it be?",
    description: "From today's reading: Daniel 3:14-20, 91-92, 95 – Shadrach, Meshach, and Abednego's unwavering faith in the face of the fiery furnace."
  },
  {
    date: "2025-04-09",
    communityType: 'leadership',
    question: "As a leader, how do you maintain your core values when facing pressure to compromise? How do you encourage your team to do the same?",
    description: "From today's reading: Daniel 3:14-20, 91-92, 95 – Shadrach, Meshach, and Abednego's unwavering faith in the face of the fiery furnace."
  },

  // April 10th
  {
    date: "2025-04-10",
    communityType: null,
    question: "Reflect on a promise or commitment you've made. How have you upheld it, and what challenges have you faced in remaining faithful to it?",
    description: "From today's reading: Genesis 17:3-9 – God's covenant with Abraham and the call to remain faithful."
  },
  {
    date: "2025-04-10",
    communityType: 'welcoming',
    question: "What's something you're looking forward to in the coming months?",
    description: "From today's reading: Genesis 17:3-9 – God's covenant with Abraham and the call to remain faithful."
  },
  {
    date: "2025-04-10",
    communityType: 'leadership',
    question: "How do you approach making and keeping commitments to your team? What systems help ensure follow-through on leadership promises?",
    description: "From today's reading: Genesis 17:3-9 – God's covenant with Abraham and the call to remain faithful."
  },

  // April 11th
  {
    date: "2025-04-11",
    communityType: null,
    question: "Have you ever felt betrayed or opposed by those close to you? How did you cope with the situation, and what insights did you gain?",
    description: "From today's reading: Jeremiah 20:10-13 – Jeremiah's lament about being denounced by those around him."
  },
  {
    date: "2025-04-11",
    communityType: 'welcoming',
    question: "What's your favorite way to connect with friends?",
    description: "From today's reading: Jeremiah 20:10-13 – Jeremiah's lament about being denounced by those around him."
  },
  {
    date: "2025-04-11",
    communityType: 'leadership',
    question: "As a leader, how do you respond to criticism or opposition from those you work closely with? What have you learned from such experiences?",
    description: "From today's reading: Jeremiah 20:10-13 – Jeremiah's lament about being denounced by those around him."
  },

  // April 12th
  {
    date: "2025-04-12",
    communityType: null,
    question: "Share about a time when you felt distant or scattered in your spiritual journey. What led you back to a sense of unity and peace?",
    description: "From today's reading: Ezekiel 37:21-28 – God's promise to gather and restore the people of Israel."
  },
  {
    date: "2025-04-12",
    communityType: 'welcoming',
    question: "What's a place where you feel most at peace or at home?",
    description: "From today's reading: Ezekiel 37:21-28 – God's promise to gather and restore the people of Israel."
  },
  {
    date: "2025-04-12",
    communityType: 'leadership',
    question: "How do you help bring unity to a team that feels fragmented or disconnected? What approaches have been most effective?",
    description: "From today's reading: Ezekiel 37:21-28 – God's promise to gather and restore the people of Israel."
  }
];

// Define fallback questions outside the function
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

// Function to get the question of the day
const getQuestionOfTheDay = ({date, communityType}) => {
  // Find question matching the given date and community type (if specified)
  const matchingQuestions = questions.filter(q => q.date === date);

  // First try to find a question matching the community type
  const communityTypeMatch = matchingQuestions.find(q => q.communityType === communityType);

  // If there's a match for the specific community type, return it
  if (communityTypeMatch) {
    return communityTypeMatch;
  }

  // If no community type match, try to find a generic question (communityType = null)
  const genericMatch = matchingQuestions.find(q => q.communityType === null);

  if (genericMatch) {
    return genericMatch;
  }

  // Fallback for dates without a specific question
  const dayOfYear = moment(date).dayOfYear();
  const fallbackIndex = dayOfYear % fallbackQuestions.length;
  return fallbackQuestions[fallbackIndex];
};

// Function to determine community type from the community object
const determineCommunityType = (community) => {
  if (!community || !community.organization) {
    return null;
  }

  if (community.organization &&
    community.organization.welcomingCommunityId === community.id) {
    return 'welcoming';
  }

  if (community.organization &&
    community.organization.leadershipCommunityId === community.id) {
    return 'leadership';
  }

  return null;
};

export default function QuestionOfTheDay({community}) {
  const [currentDate, setCurrentDate] = useState("");
  const [dailyQuestion, setDailyQuestion] = useState({ question: "", description: "" });
  const [communityType, setCommunityType] = useState(null);

  useEffect(() => {
    // Determine the community type based on the community object
    const type = determineCommunityType(community);
    setCommunityType(type);

    // Get today's date in YYYY-MM-DD format
    const today = moment().format("YYYY-MM-DD");
    setCurrentDate(today);

    // Get question for today with the proper parameters
    const questionData = getQuestionOfTheDay({
      date: today,
      communityType: type
    });

    setDailyQuestion(questionData);
  }, [community]);

  return (
    <div className="mt-3 text-gray-700 bg-white rounded-xl py-3 shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-4 flex items-center border-b border-gray-100 pb-2">
        <h3 className="font-bold text-gray-900 text-lg">
          {communityType === 'welcoming'
            ? 'Welcoming Question of the Day'
            : communityType === 'leadership'
              ? 'Leadership Question of the Day'
              : 'Question of the Day'}
        </h3>
      </div>

      {/* Content */}
      <div className="px-4 pt-3 space-y-3">
        <p className="font-medium text-gray-800 text-lg">{dailyQuestion.question}</p>
        <p className="text-gray-600 text-sm italic">{dailyQuestion.description}</p>

        <div className="mt-2 w-full text-gray-600 font-medium py-2 px-4 rounded-lg transition duration-200 text-sm flex items-center justify-center">
          Post to your 12
        </div>
      </div>
    </div>
  );
}