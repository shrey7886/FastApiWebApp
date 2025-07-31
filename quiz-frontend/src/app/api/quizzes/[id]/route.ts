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

    console.log('🎯 Fetching quiz:', { quizId, tenant_id });

    // Generate dynamic quiz based on ID
    const quizNumber = parseInt(quizId) % 1000; // Use modulo to create variety
    const topics = ['Mathematics', 'Science', 'History', 'Geography', 'Literature', 'Technology', 'Art', 'Music', 'Sports', 'Cooking'];
    const difficulties = ['easy', 'medium', 'hard'];
    
    const selectedTopic = topics[quizNumber % topics.length];
    const selectedDifficulty = difficulties[quizNumber % difficulties.length];
    const questionCount = 3 + (quizNumber % 8); // 3-10 questions

    // Generate questions based on topic
    const questions = generateTopicQuestions(quizId, selectedTopic, selectedDifficulty, questionCount);

    const quiz = {
      id: quizId,
      title: `${selectedTopic} Quiz`,
      description: `A ${selectedDifficulty} quiz about ${selectedTopic}`,
      topic: selectedTopic,
      difficulty: selectedDifficulty,
      num_questions: questionCount,
      duration: 10 + (questionCount * 2), // Dynamic duration
      tenant_id: tenant_id || 'default',
      questions: questions,
      created_at: new Date().toISOString()
    };

    console.log('✅ Quiz fetched successfully:', { id: quizId, topic: selectedTopic, questions: questionCount });
    return NextResponse.json(quiz);
  } catch (error) {
    console.error('❌ Error fetching quiz:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz' },
      { status: 500 }
    );
  }
}

function generateTopicQuestions(quizId: string, topic: string, difficulty: string, count: number) {
  const questions = [];
  
  const topicQuestions = {
    'Mathematics': [
      {
        question: 'What is the sum of the interior angles of a hexagon?',
        options: ['360 degrees', '540 degrees', '720 degrees', '900 degrees'],
        correct: '720 degrees',
        explanation: 'The sum of the interior angles of a polygon with n sides is (n-2) × 180°. For a hexagon (n=6), it\'s (6-2) × 180° = 4 × 180° = 720°.'
      },
      {
        question: 'Which of the following is an irrational number?',
        options: ['√4', '√9', '√16', '√17'],
        correct: '√17',
        explanation: 'An irrational number cannot be expressed as a simple fraction. √17 is not a perfect square and its decimal representation is non-repeating and non-terminating.'
      },
      {
        question: 'Solve for x: 3x + 5 = 14',
        options: ['x = 2', 'x = 3', 'x = 4', 'x = 5'],
        correct: 'x = 3',
        explanation: 'Subtracting 5 from both sides gives 3x = 9. Dividing both sides by 3 gives x = 3.'
      },
      {
        question: 'What is the derivative of the function f(x) = x³ + 2x?',
        options: ['x² + 2', 'x² + 2', '3x² + 2', '3x² + 2x'],
        correct: '3x² + 2',
        explanation: 'Using the power rule (d/dx x^n = nx^(n-1)), the derivative of x³ is 3x² and the derivative of 2x is 2. Therefore, the derivative of f(x) is 3x² + 2.'
      }
    ],
    'Science': [
      {
        question: 'What is the chemical symbol for gold?',
        options: ['Ag', 'Au', 'Fe', 'Cu'],
        correct: 'Au',
        explanation: 'Au comes from the Latin word "aurum" which means gold.'
      },
      {
        question: 'Which planet is closest to the Sun?',
        options: ['Venus', 'Mercury', 'Earth', 'Mars'],
        correct: 'Mercury',
        explanation: 'Mercury is the first planet from the Sun in our solar system.'
      },
      {
        question: 'What is the largest organ in the human body?',
        options: ['Heart', 'Brain', 'Liver', 'Skin'],
        correct: 'Skin',
        explanation: 'The skin is the largest organ in the human body, covering approximately 20 square feet in adults.'
      }
    ],
    'History': [
      {
        question: 'In which year did World War II end?',
        options: ['1943', '1944', '1945', '1946'],
        correct: '1945',
        explanation: 'World War II ended in 1945 with the surrender of Germany in May and Japan in September.'
      },
      {
        question: 'Who was the first President of the United States?',
        options: ['John Adams', 'Thomas Jefferson', 'George Washington', 'Benjamin Franklin'],
        correct: 'George Washington',
        explanation: 'George Washington served as the first President of the United States from 1789 to 1797.'
      }
    ],
    'Technology': [
      {
        question: 'What does CPU stand for?',
        options: ['Central Processing Unit', 'Computer Personal Unit', 'Central Personal Unit', 'Computer Processing Unit'],
        correct: 'Central Processing Unit',
        explanation: 'CPU stands for Central Processing Unit, which is the primary component of a computer that performs most of the processing.'
      },
      {
        question: 'Which programming language was created by Guido van Rossum?',
        options: ['Java', 'Python', 'JavaScript', 'C++'],
        correct: 'Python',
        explanation: 'Python was created by Guido van Rossum and was released in 1991.'
      }
    ]
  };

  const topicQuestionSet = topicQuestions[topic as keyof typeof topicQuestions] || topicQuestions['Mathematics'];
  
  for (let i = 0; i < count; i++) {
    const questionData = topicQuestionSet[i % topicQuestionSet.length];
    questions.push({
      id: `q_${quizId}_${i}`,
      question_text: questionData.question,
      option_a: questionData.options[0],
      option_b: questionData.options[1],
      option_c: questionData.options[2],
      option_d: questionData.options[3],
      correct_answer: questionData.correct,
      explanation: questionData.explanation
    });
  }

  return questions;
} 