import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { quiz_id, answers, time_taken, tenant_id } = body;

    // Mock quiz submission processing
    // In production, you would save to a database
    const mockQuiz = {
      id: quiz_id,
      questions: [
        {
          id: 'q_1',
          question_text: 'What is the capital of France?',
          correct_answer: 'Paris'
        },
        {
          id: 'q_2',
          question_text: 'Which planet is closest to the Sun?',
          correct_answer: 'Mercury'
        },
        {
          id: 'q_3',
          question_text: 'What is 2 + 2?',
          correct_answer: '4'
        },
        {
          id: 'q_4',
          question_text: 'What is the largest ocean on Earth?',
          correct_answer: 'Pacific Ocean'
        },
        {
          id: 'q_5',
          question_text: 'Who painted the Mona Lisa?',
          correct_answer: 'Leonardo da Vinci'
        }
      ]
    };

    // Process answers and calculate score
    let correctAnswers = 0;
    const results = mockQuiz.questions.map((question, index) => {
      const userAnswer = answers[question.id] || '';
      const isCorrect = userAnswer === question.correct_answer;
      if (isCorrect) correctAnswers++;
      
      return {
        question_id: question.id,
        question_text: question.question_text,
        user_answer: userAnswer,
        correct_answer: question.correct_answer,
        is_correct: isCorrect
      };
    });

    const score = correctAnswers;
    const totalQuestions = mockQuiz.questions.length;
    const percentage = Math.round((score / totalQuestions) * 100);

    // Generate grade
    let grade = 'F';
    if (percentage >= 90) grade = 'A';
    else if (percentage >= 80) grade = 'B';
    else if (percentage >= 70) grade = 'C';
    else if (percentage >= 60) grade = 'D';

    const result = {
      id: Date.now().toString(),
      quiz_id: quiz_id,
      score: score,
      total_questions: totalQuestions,
      percentage: percentage,
      grade: grade,
      time_taken: time_taken || 0,
      completed_at: new Date().toISOString(),
      tenant_id: tenant_id || 'default',
      results: results
    };

    return NextResponse.json({
      success: true,
      result: result
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    return NextResponse.json(
      { error: 'Failed to submit quiz' },
      { status: 500 }
    );
  }
} 