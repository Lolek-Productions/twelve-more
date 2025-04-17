'use client';

import { useEffect, useState } from "react";
import moment from "moment/moment";
import CommunitySelector from "@/components/CommunitySelector.jsx";

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
  },
  // April 17, 2025 - Holy Thursday
  {
    date: "2025-04-17",
    communityType: null,
    question: "At the Last Supper, Jesus washed his disciples' feet as an example of humble service. Share about a time when someone served you in a way that deeply moved you, or when you had the opportunity to serve others in a meaningful way.",
    description: "From today's reading: John 13:1-15 - Jesus washes the disciples' feet and tells them, 'I have given you a model to follow, so that as I have done for you, you should also do.'"
  },
  {
    date: "2025-04-17",
    communityType: 'welcoming',
    question: "What's a simple way you like to show care for others in your daily life?",
    description: "From today's reading: John 13:1-15 - Jesus washes the disciples' feet and tells them, 'I have given you a model to follow, so that as I have done for you, you should also do.'"
  },
  {
    date: "2025-04-17",
    communityType: 'leadership',
    question: "As a leader, how do you practice and model servant leadership? What challenges do you face in balancing authority with humility?",
    description: "From today's reading: John 13:1-15 - Jesus washes the disciples' feet and tells them, 'I have given you a model to follow, so that as I have done for you, you should also do.'"
  },

  // April 18, 2025 - Good Friday
  {
    date: "2025-04-18",
    communityType: null,
    question: "Reflect on a time when you experienced profound suffering or loss. How did your faith sustain you through that experience, and what did you learn about Christ's sacrifice?",
    description: "From today's reading: Isaiah 52:13-53:12 - A passage about the Suffering Servant who was 'despised and rejected' yet 'bore our sufferings'."
  },
  {
    date: "2025-04-18",
    communityType: 'welcoming',
    question: "What's one meaningful way you've observed Good Friday in the past, or how do you plan to observe it this year?",
    description: "From today's reading: Isaiah 52:13-53:12 - A passage about the Suffering Servant who was 'despised and rejected' yet 'bore our sufferings'."
  },
  {
    date: "2025-04-18",
    communityType: 'leadership',
    question: "As a leader, how do you help those you serve navigate times of suffering or hardship? What insights from Christ's Passion guide your approach?",
    description: "From today's reading: Isaiah 52:13-53:12 - A passage about the Suffering Servant who was 'despised and rejected' yet 'bore our sufferings'."
  },

  // April 19, 2025 - Holy Saturday
  {
    date: "2025-04-19",
    communityType: null,
    question: "Holy Saturday is a day of waiting between death and resurrection. Share about a time of waiting in your life when you felt in-between—what did you learn in that liminal space?",
    description: "Holy Saturday is a day of watching and waiting, as Jesus lies in the tomb before the Resurrection."
  },
  {
    date: "2025-04-19",
    communityType: 'welcoming',
    question: "What's something you're looking forward to with hope or anticipation?",
    description: "Holy Saturday is a day of watching and waiting, as Jesus lies in the tomb before the Resurrection."
  },
  {
    date: "2025-04-19",
    communityType: 'leadership',
    question: "As a leader, how do you maintain hope and vision during periods of uncertainty or transition? What practices help you stay grounded?",
    description: "Holy Saturday is a day of watching and waiting, as Jesus lies in the tomb before the Resurrection."
  },

  // April 20, 2025 - Easter Sunday
  {
    date: "2025-04-20",
    communityType: null,
    question: "What area of your life needs resurrection or new life right now? How does Christ's victory over death bring you hope in this situation?",
    description: "From today's reading: John 20:1-9 - Mary Magdalene discovers the empty tomb, and Peter and the other disciple witness the burial cloths, beginning to understand Christ is risen."
  },
  {
    date: "2025-04-20",
    communityType: 'welcoming',
    question: "What's one way you celebrate or express joy in your life?",
    description: "From today's reading: John 20:1-9 - Mary Magdalene discovers the empty tomb, and Peter and the other disciple witness the burial cloths, beginning to understand Christ is risen."
  },
  {
    date: "2025-04-20",
    communityType: 'leadership',
    question: "As a leader, how do you foster a culture of hope and renewal within your team or community? What resurrection principles guide your leadership?",
    description: "From today's reading: John 20:1-9 - Mary Magdalene discovers the empty tomb, and Peter and the other disciple witness the burial cloths, beginning to understand Christ is risen."
  },

  // April 21, 2025 - Monday in the Octave of Easter
  {
    date: "2025-04-21",
    communityType: null,
    question: "The disciples were witnesses to the resurrection, called to share what they had seen. How have you witnessed God's transformative power in your life, and how have you shared that with others?",
    description: "From today's reading: Acts 2:14, 22-33 - Peter proclaims that they are all witnesses to Christ's resurrection and God's promises fulfilled."
  },
  {
    date: "2025-04-21",
    communityType: 'welcoming',
    question: "What's a recent experience that surprised you in a positive way?",
    description: "From today's reading: Acts 2:14, 22-33 - Peter proclaims that they are all witnesses to Christ's resurrection and God's promises fulfilled."
  },
  {
    date: "2025-04-21",
    communityType: 'leadership',
    question: "As a leader, how do you help your team or community recognize and celebrate evidence of growth, progress, or transformation?",
    description: "From today's reading: Acts 2:14, 22-33 - Peter proclaims that they are all witnesses to Christ's resurrection and God's promises fulfilled."
  },

  // April 22, 2025 - Tuesday in the Octave of Easter
  {
    date: "2025-04-22",
    communityType: null,
    question: "Mary Magdalene initially didn't recognize Jesus in the garden. Have you ever failed to recognize God's presence in a situation, only to understand it later? What helped you see more clearly?",
    description: "From today's reading: John 20:11-18 - Mary Magdalene encounters the risen Jesus but doesn't recognize him until he calls her by name."
  },
  {
    date: "2025-04-22",
    communityType: 'welcoming',
    question: "Has anyone ever called you by name in a way that made you feel truly seen and known? What was that experience like?",
    description: "From today's reading: John 20:11-18 - Mary Magdalene encounters the risen Jesus but doesn't recognize him until he calls her by name."
  },
  {
    date: "2025-04-22",
    communityType: 'leadership',
    question: "As a leader, how do you ensure the people you serve feel personally known and valued? What practices help you see beyond roles to the individual?",
    description: "From today's reading: John 20:11-18 - Mary Magdalene encounters the risen Jesus but doesn't recognize him until he calls her by name."
  },

  // April 23, 2025 - Wednesday in the Octave of Easter
  {
    date: "2025-04-23",
    communityType: null,
    question: "On the road to Emmaus, the disciples recognized Jesus in the breaking of bread. Where have you experienced Christ's presence in ordinary moments or everyday encounters?",
    description: "From today's reading: Luke 24:13-35 - The disciples on the road to Emmaus have their eyes opened as Jesus breaks bread with them."
  },
  {
    date: "2025-04-23",
    communityType: 'welcoming',
    question: "Is there a meal or food tradition that holds special meaning for you? What makes it significant?",
    description: "From today's reading: Luke 24:13-35 - The disciples on the road to Emmaus have their eyes opened as Jesus breaks bread with them."
  },
  {
    date: "2025-04-23",
    communityType: 'leadership',
    question: "As a leader, how do you create spaces for meaningful connection and revelation through shared experiences? What role does hospitality play in your leadership?",
    description: "From today's reading: Luke 24:13-35 - The disciples on the road to Emmaus have their eyes opened as Jesus breaks bread with them."
  },

  // April 24, 2025 - Thursday in the Octave of Easter
  {
    date: "2025-04-24",
    communityType: null,
    question: "Jesus opened the disciples' minds to understand the Scriptures. Share about a time when a passage of Scripture suddenly became clear to you in a new way. What insight did you gain?",
    description: "From today's reading: Luke 24:35-48 - Jesus appears to the disciples, showing his wounds and opening their minds to understand the Scriptures."
  },
  {
    date: "2025-04-24",
    communityType: 'welcoming',
    question: "What's something you've learned recently that changed how you see things?",
    description: "From today's reading: Luke 24:35-48 - Jesus appears to the disciples, showing his wounds and opening their minds to understand the Scriptures."
  },
  {
    date: "2025-04-24",
    communityType: 'leadership',
    question: "As a leader, how do you help those you serve gain deeper understanding and insight? How do you approach teaching difficult or challenging concepts?",
    description: "From today's reading: Luke 24:35-48 - Jesus appears to the disciples, showing his wounds and opening their minds to understand the Scriptures."
  },

  // April 25, 2025 - Friday in the Octave of Easter
  {
    date: "2025-04-25",
    communityType: null,
    question: "After the resurrection, Jesus instructs his disciples to 'cast the net over the right side of the boat.' Share about a time when following an unexpected direction or taking a different approach led to abundance in your life.",
    description: "From today's reading: John 21:1-14 - Jesus appears to the disciples by the Sea of Tiberias and guides them to a miraculous catch of fish."
  },
  {
    date: "2025-04-25",
    communityType: 'welcoming',
    question: "What's something unexpected that turned out to be a blessing in your life?",
    description: "From today's reading: John 21:1-14 - Jesus appears to the disciples by the Sea of Tiberias and guides them to a miraculous catch of fish."
  },
  {
    date: "2025-04-25",
    communityType: 'leadership',
    question: "As a leader, how do you recognize when it's time to try a different approach? How do you encourage innovation and creative problem-solving in your team?",
    description: "From today's reading: John 21:1-14 - Jesus appears to the disciples by the Sea of Tiberias and guides them to a miraculous catch of fish."
  },

  // April 26, 2025 - Saturday in the Octave of Easter
  {
    date: "2025-04-26",
    communityType: null,
    question: "Jesus commissioned his disciples to 'go into the whole world and proclaim the Gospel.' In what ways are you called to share your faith with others? What challenges or opportunities do you face in this mission?",
    description: "From today's reading: Mark 16:9-15 - Jesus commissions the disciples to go forth and proclaim the Gospel to all creation."
  },
  {
    date: "2025-04-26",
    communityType: 'welcoming',
    question: "What's one piece of good news you'd like to share with others today?",
    description: "From today's reading: Mark 16:9-15 - Jesus commissions the disciples to go forth and proclaim the Gospel to all creation."
  },
  {
    date: "2025-04-26",
    communityType: 'leadership',
    question: "As a leader, how do you inspire and equip others to share the mission beyond your immediate community? What principles guide your approach to outreach?",
    description: "From today's reading: Mark 16:9-15 - Jesus commissions the disciples to go forth and proclaim the Gospel to all creation."
  },

  // April 27, 2025 - Divine Mercy Sunday (Second Sunday of Easter)
  {
    date: "2025-04-27",
    communityType: null,
    question: "Like Thomas, many of us struggle with doubt. Share about a time when you experienced doubt in your faith journey. What helped you move toward deeper trust and belief?",
    description: "From today's reading: John 20:19-31 - Thomas doubts the resurrection until he sees Jesus's wounds, and Jesus says, 'Blessed are those who have not seen and have believed.'"
  },
  {
    date: "2025-04-27",
    communityType: 'welcoming',
    question: "Who is someone who has shown you compassion or mercy when you needed it most?",
    description: "From today's reading: John 20:19-31 - Thomas doubts the resurrection until he sees Jesus's wounds, and Jesus says, 'Blessed are those who have not seen and have believed.'"
  },
  {
    date: "2025-04-27",
    communityType: 'leadership',
    question: "As a leader, how do you respond to doubt or questioning within your team or community? How do you create space for both honest questions and growing faith?",
    description: "From today's reading: John 20:19-31 - Thomas doubts the resurrection until he sees Jesus's wounds, and Jesus says, 'Blessed are those who have not seen and have believed.'"
  },

  // April 28, 2025 - Monday of the Second Week of Easter
  {
    date: "2025-04-28",
    communityType: null,
    question: "Nicodemus struggled to understand what it means to be 'born from above.' Share about a spiritual rebirth or renewal you've experienced. What changed for you?",
    description: "From today's reading: John 3:1-8 - Jesus tells Nicodemus that one must be born of water and Spirit to enter the kingdom of God."
  },
  {
    date: "2025-04-28",
    communityType: 'welcoming',
    question: "What's something in your life that feels like it's being renewed or refreshed right now?",
    description: "From today's reading: John 3:1-8 - Jesus tells Nicodemus that one must be born of water and Spirit to enter the kingdom of God."
  },
  {
    date: "2025-04-28",
    communityType: 'leadership',
    question: "As a leader, how do you facilitate renewal and fresh perspective within your organization or team? How do you recognize when it's time for a new beginning?",
    description: "From today's reading: John 3:1-8 - Jesus tells Nicodemus that one must be born of water and Spirit to enter the kingdom of God."
  },

  // April 29, 2025 - St. Catherine of Siena
  {
    date: "2025-04-29",
    communityType: null,
    question: "St. Catherine of Siena said, 'Be who God meant you to be and you will set the world on fire.' How are you discovering and living out God's unique calling for your life?",
    description: "Today we celebrate St. Catherine of Siena, a Doctor of the Church known for her mystical experiences, writings, and bold leadership during difficult times in the Church."
  },
  {
    date: "2025-04-29",
    communityType: 'welcoming',
    question: "What's something you're passionate about that brings you joy?",
    description: "Today we celebrate St. Catherine of Siena, a Doctor of the Church known for her mystical experiences, writings, and bold leadership during difficult times in the Church."
  },
  {
    date: "2025-04-29",
    communityType: 'leadership',
    question: "As a leader, how do you discern and develop the unique gifts of those you serve? How do you help others discover their calling?",
    description: "Today we celebrate St. Catherine of Siena, a Doctor of the Church known for her mystical experiences, writings, and bold leadership during difficult times in the Church."
  },

  // April 30, 2025 - Wednesday of the Second Week of Easter
  {
    date: "2025-04-30",
    communityType: null,
    question: "Jesus says, 'God so loved the world that he gave his only Son.' How has God's sacrificial love transformed your understanding of love and sacrifice in your own life?",
    description: "From today's reading: John 3:16-21 - Jesus explains that God sent his Son not to condemn the world but to save it through him."
  },
  {
    date: "2025-04-30",
    communityType: 'welcoming',
    question: "What's a simple way you show love to others in your daily life?",
    description: "From today's reading: John 3:16-21 - Jesus explains that God sent his Son not to condemn the world but to save it through him."
  },
  {
    date: "2025-04-30",
    communityType: 'leadership',
    question: "As a leader, how do you practice sacrificial love within your leadership role? How do you balance caring for others with caring for yourself?",
    description: "From today's reading: John 3:16-21 - Jesus explains that God sent his Son not to condemn the world but to save it through him."
  },

  // May 1, 2025 - Thursday of the Second Week of Easter (St. Joseph the Worker)
  {
    date: "2025-05-01",
    communityType: null,
    question: "St. Joseph is honored as a model worker who served God faithfully in his daily tasks. How do you see your work—paid or unpaid—as part of your spiritual journey and service to God?",
    description: "Today we honor St. Joseph the Worker, celebrating the dignity of labor and the sanctification of ordinary work."
  },
  {
    date: "2025-05-01",
    communityType: 'welcoming',
    question: "What's something you've created or accomplished that you're proud of?",
    description: "Today we honor St. Joseph the Worker, celebrating the dignity of labor and the sanctification of ordinary work."
  },
  {
    date: "2025-05-01",
    communityType: 'leadership',
    question: "As a leader, how do you honor the dignity of work and workers within your sphere of influence? How do you help others find meaning in their daily tasks?",
    description: "Today we honor St. Joseph the Worker, celebrating the dignity of labor and the sanctification of ordinary work."
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

        <CommunitySelector />
        {/*<div className="mt-2 w-full text-gray-600 font-medium py-2 px-4 rounded-lg transition duration-200 text-sm flex items-center justify-center">*/}
        {/*  Post to your 12*/}
        {/*</div>*/}
      </div>
    </div>
  );
}