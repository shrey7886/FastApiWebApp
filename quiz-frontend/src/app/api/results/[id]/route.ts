import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resultId = params.id;
    console.log('🎯 Fetching quiz result:', resultId);

    // For demo purposes, we'll generate a mock result based on the ID
    // In production, this would fetch from a database
    const quizNumber = parseInt(resultId) % 1000;
    const topics = ['Mathematics', 'Science', 'History', 'Geography', 'Literature', 'Technology'];
    const selectedTopic = topics[quizNumber % topics.length];
    
    // Generate mock questions with explanations
    const questions = [
      {
        id: 1,
        question_text: 'What is the capital of France?',
        user_answer: 'Paris',
        correct_answer: 'Paris',
        is_correct: true,
        explanation: 'Paris is the capital and largest city of France. It has been the capital since 987 CE and is known for its rich history, culture, and landmarks like the Eiffel Tower.',
        option_a: 'Paris',
        option_b: 'London',
        option_c: 'Berlin',
        option_d: 'Madrid'
      },
      {
        id: 2,
        question_text: 'Which planet is closest to the Sun?',
        user_answer: 'Venus',
        correct_answer: 'Mercury',
        is_correct: false,
        explanation: 'Mercury is the first planet from the Sun in our solar system. It orbits at an average distance of about 57.9 million kilometers from the Sun, making it the closest planet.',
        option_a: 'Venus',
        option_b: 'Mercury',
        option_c: 'Earth',
        option_d: 'Mars'
      },
      {
        id: 3,
        question_text: 'What is 2 + 2?',
        user_answer: '4',
        correct_answer: '4',
        is_correct: true,
        explanation: '2 + 2 equals 4. This is a basic arithmetic operation where we add two numbers together to get their sum.',
        option_a: '3',
        option_b: '4',
        option_c: '5',
        option_d: '6'
      },
      {
        id: 4,
        question_text: 'Who painted the Mona Lisa?',
        user_answer: 'Leonardo da Vinci',
        correct_answer: 'Leonardo da Vinci',
        is_correct: true,
        explanation: 'The Mona Lisa was painted by Leonardo da Vinci in the early 16th century. It is one of the most famous and valuable paintings in the world, housed in the Louvre Museum in Paris.',
        option_a: 'Vincent van Gogh',
        option_b: 'Leonardo da Vinci',
        option_c: 'Pablo Picasso',
        option_d: 'Michelangelo'
      },
      {
        id: 5,
        question_text: 'What is the largest ocean on Earth?',
        user_answer: 'Atlantic Ocean',
        correct_answer: 'Pacific Ocean',
        is_correct: false,
        explanation: 'The Pacific Ocean is the largest and deepest ocean on Earth, covering approximately 63 million square miles. It contains more than half of the free water on Earth.',
        option_a: 'Atlantic Ocean',
        option_b: 'Indian Ocean',
        option_c: 'Arctic Ocean',
        option_d: 'Pacific Ocean'
      }
    ];

    // Calculate score based on correct answers
    const correctAnswers = questions.filter(q => q.is_correct).length;
    const totalQuestions = questions.length;
    const score = correctAnswers;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);

    const result = {
      id: resultId,
      quiz_title: `${selectedTopic} Quiz`,
      subject: selectedTopic,
      score: score,
      total_questions: totalQuestions,
      percentage: percentage,
      time_taken: 450, // 7 minutes 30 seconds
      completed_at: new Date().toISOString(),
      questions: questions
    };

    console.log('✅ Quiz result fetched successfully:', { 
      id: resultId, 
      score, 
      percentage, 
      questions: questions.length 
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Error fetching quiz result:', error);
    
    // Return a fallback result if there's an error
    const fallbackResult = {
      id: params.id,
      quiz_title: 'Sample Quiz',
      subject: 'General Knowledge',
      score: 3,
      total_questions: 5,
      percentage: 60,
      time_taken: 300,
      completed_at: new Date().toISOString(),
      questions: [
        {
          id: 1,
          question_text: 'What is the capital of France?',
          user_answer: 'Paris',
          correct_answer: 'Paris',
          is_correct: true,
          explanation: 'Paris is the capital and largest city of France.',
          option_a: 'Paris',
          option_b: 'London',
          option_c: 'Berlin',
          option_d: 'Madrid'
        },
        {
          id: 2,
          question_text: 'Which planet is closest to the Sun?',
          user_answer: 'Venus',
          correct_answer: 'Mercury',
          is_correct: false,
          explanation: 'Mercury is the first planet from the Sun in our solar system.',
          option_a: 'Venus',
          option_b: 'Mercury',
          option_c: 'Earth',
          option_d: 'Mars'
        },
        {
          id: 3,
          question_text: 'What is 2 + 2?',
          user_answer: '4',
          correct_answer: '4',
          is_correct: true,
          explanation: '2 + 2 equals 4.',
          option_a: '3',
          option_b: '4',
          option_c: '5',
          option_d: '6'
        },
        {
          id: 4,
          question_text: 'What is the largest ocean on Earth?',
          user_answer: 'Atlantic Ocean',
          correct_answer: 'Pacific Ocean',
          is_correct: false,
          explanation: 'The Pacific Ocean is the largest and deepest ocean on Earth.',
          option_a: 'Atlantic Ocean',
          option_b: 'Indian Ocean',
          option_c: 'Arctic Ocean',
          option_d: 'Pacific Ocean'
        },
        {
          id: 5,
          question_text: 'Who painted the Mona Lisa?',
          user_answer: 'Leonardo da Vinci',
          correct_answer: 'Leonardo da Vinci',
          is_correct: true,
          explanation: 'The Mona Lisa was painted by Leonardo da Vinci in the early 16th century.',
          option_a: 'Vincent van Gogh',
          option_b: 'Leonardo da Vinci',
          option_c: 'Pablo Picasso',
          option_d: 'Michelangelo'
        }
      ]
    };

    console.log('🔄 Returning fallback result due to error');
    return NextResponse.json(fallbackResult);
  }
} 