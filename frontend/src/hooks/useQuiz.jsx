import { useState, useEffect } from 'react';

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "How do you approach new challenges?",
    options: [
      { text: "Head-on with confidence", value: 1, archetype: "Leader" },
      { text: "Carefully analyze first", value: 2, archetype: "Analyst" },
      { text: "Collaborate with others", value: 3, archetype: "Collaborator" },
      { text: "Trust my intuition", value: 4, archetype: "Visionary" }
    ]
  },
  {
    id: 2,
    question: "What motivates you most?",
    options: [
      { text: "Achieving goals", value: 1, archetype: "Achiever" },
      { text: "Learning and growth", value: 2, archetype: "Scholar" },
      { text: "Helping others succeed", value: 3, archetype: "Mentor" },
      { text: "Creating something new", value: 4, archetype: "Creator" }
    ]
  },
  {
    id: 3,
    question: "How do you handle stress?",
    options: [
      { text: "Take action immediately", value: 1, archetype: "Leader" },
      { text: "Step back and reflect", value: 2, archetype: "Analyst" },
      { text: "Seek support from others", value: 3, archetype: "Mentor" },
      { text: "Find creative solutions", value: 4, archetype: "Creator" }
    ]
  },
  {
    id: 4,
    question: "What's your ideal work environment?",
    options: [
      { text: "Fast-paced and dynamic", value: 1, archetype: "Achiever" },
      { text: "Structured and organized", value: 2, archetype: "Analyst" },
      { text: "Supportive and collaborative", value: 3, archetype: "Collaborator" },
      { text: "Flexible and autonomous", value: 4, archetype: "Visionary" }
    ]
  },
  {
    id: 5,
    question: "How do you make decisions?",
    options: [
      { text: "Quickly and decisively", value: 1, archetype: "Leader" },
      { text: "Based on data and logic", value: 2, archetype: "Analyst" },
      { text: "Considering impact on others", value: 3, archetype: "Mentor" },
      { text: "Following my gut feeling", value: 4, archetype: "Visionary" }
    ]
  },
  {
    id: 6,
    question: "What's your greatest strength?",
    options: [
      { text: "Leadership and influence", value: 1, archetype: "Leader" },
      { text: "Problem-solving ability", value: 2, archetype: "Analyst" },
      { text: "Empathy and understanding", value: 3, archetype: "Mentor" },
      { text: "Creativity and innovation", value: 4, archetype: "Creator" }
    ]
  },
  {
    id: 7,
    question: "How do you approach learning?",
    options: [
      { text: "Hands-on experience", value: 1, archetype: "Achiever" },
      { text: "Deep research and study", value: 2, archetype: "Scholar" },
      { text: "Learning from others", value: 3, archetype: "Mentor" },
      { text: "Experimentation and discovery", value: 4, archetype: "Creator" }
    ]
  },
  {
    id: 8,
    question: "What drives your success?",
    options: [
      { text: "Competition and winning", value: 1, archetype: "Achiever" },
      { text: "Excellence and mastery", value: 2, archetype: "Scholar" },
      { text: "Team success", value: 3, archetype: "Collaborator" },
      { text: "Personal growth", value: 4, archetype: "Creator" }
    ]
  },
  {
    id: 9,
    question: "How do you handle conflicts?",
    options: [
      { text: "Address them directly", value: 1, archetype: "Leader" },
      { text: "Analyze the root cause", value: 2, archetype: "Analyst" },
      { text: "Mediate and find compromise", value: 3, archetype: "Collaborator" },
      { text: "Look for creative solutions", value: 4, archetype: "Creator" }
    ]
  },
  {
    id: 10,
    question: "What's your life philosophy?",
    options: [
      { text: "Make things happen", value: 1, archetype: "Achiever" },
      { text: "Understand the world", value: 2, archetype: "Scholar" },
      { text: "Connect with others", value: 3, archetype: "Collaborator" },
      { text: "Create and innovate", value: 4, archetype: "Creator" }
    ]
  }
];

const ARCHETYPES = {
  "Leader": "Natural born leader who inspires and guides others toward common goals",
  "Analyst": "Strategic thinker who excels at breaking down complex problems",
  "Collaborator": "Team player who brings people together and fosters cooperation",
  "Visionary": "Innovative thinker who sees possibilities others miss",
  "Achiever": "Results-driven individual focused on accomplishing objectives",
  "Scholar": "Lifelong learner passionate about knowledge and understanding",
  "Mentor": "Supportive guide who helps others develop and grow",
  "Creator": "Artistic soul who brings new ideas into reality"
};

const API_URL = import.meta.env.VITE_API_URL || '/api';

export function useQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [error, setError] = useState(null);

  const handleAnswer = (questionId, option) => {
    setAnswers(prev => ({ ...prev, [questionId]: option.archetype }));
    
    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      completeQuiz();
    }
  };

  const completeQuiz = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/quiz/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          email: userEmail,
          name: userName
        })
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Submission failed');
      }

      const data = await response.json();
      setResult(data);
      setIsCompleted(true);
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setIsCompleted(false);
    setResult(null);
    setUserEmail('');
    setUserName('');
    setError(null);
  };

  const progress = ((currentQuestion + 1) / QUIZ_QUESTIONS.length) * 100;

  return {
    currentQuestion,
    question: QUIZ_QUESTIONS[currentQuestion],
    questions: QUIZ_QUESTIONS,
    answers,
    isCompleted,
    result,
    isLoading,
    progress,
    userEmail,
    userName,
    setUserEmail,
    setUserName,
    handleAnswer,
    resetQuiz,
    ARCHETYPES,
    error
  };
}
