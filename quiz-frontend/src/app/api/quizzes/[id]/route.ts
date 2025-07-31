import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const quizId = params.id;
    const { searchParams } = new URL(request.url);
    const tenant_id = searchParams.get('tenant_id');

    // For demo purposes, return a mock quiz
    // In production, you would fetch from a database
    const mockQuiz = {
      id: quizId,
      title: 'Sample Quiz',
      description: 'A sample quiz for testing',
      topic: 'General Knowledge',
      difficulty: 'medium',
      num_questions: 5,
      duration: 10,
      tenant_id: tenant_id || 'default',
      questions: [
        {
          id: 'q_1',
          question_text: 'What is the capital of France?',
          option_a: 'Paris',
          option_b: 'London',
          option_c: 'Berlin',
          option_d: 'Madrid',
          correct_answer: 'Paris',
          explanation: 'Paris is the capital and largest city of France.'
        },
        {
          id: 'q_2',
          question_text: 'Which planet is closest to the Sun?',
          option_a: 'Venus',
          option_b: 'Mercury',
          option_c: 'Earth',
          option_d: 'Mars',
          correct_answer: 'Mercury',
          explanation: 'Mercury is the first planet from the Sun in our solar system.'
        },
        {
          id: 'q_3',
          question_text: 'What is 2 + 2?',
          option_a: '3',
          option_b: '4',
          option_c: '5',
          option_d: '6',
          correct_answer: '4',
          explanation: '2 + 2 equals 4.'
        },
        {
          id: 'q_4',
          question_text: 'What is the largest ocean on Earth?',
          option_a: 'Atlantic Ocean',
          option_b: 'Indian Ocean',
          option_c: 'Arctic Ocean',
          option_d: 'Pacific Ocean',
          correct_answer: 'Pacific Ocean',
          explanation: 'The Pacific Ocean is the largest and deepest ocean on Earth.'
        },
        {
          id: 'q_5',
          question_text: 'Who painted the Mona Lisa?',
          option_a: 'Vincent van Gogh',
          option_b: 'Leonardo da Vinci',
          option_c: 'Pablo Picasso',
          option_d: 'Michelangelo',
          correct_answer: 'Leonardo da Vinci',
          explanation: 'The Mona Lisa was painted by Leonardo da Vinci in the early 16th century.'
        }
      ],
      created_at: new Date().toISOString()
    };

    return NextResponse.json(mockQuiz);
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz' },
      { status: 500 }
    );
  }
} 