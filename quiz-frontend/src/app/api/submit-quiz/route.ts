import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { quiz_id, answers, time_taken, tenant_id } = body;

    console.log('📝 Quiz submission received:', { quiz_id, time_taken, tenant_id });

    // Calculate mock results
    const totalQuestions = Object.keys(answers || {}).length;
    const correctAnswers = Math.floor(totalQuestions * 0.8); // Mock 80% success rate
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const timeUsed = time_taken || 300;

    const mockResult = {
      id: Date.now().toString(),
      quiz_id: quiz_id || 'mock-quiz',
      user_id: 'mock-user',
      tenant_id: tenant_id || 'default',
      score: score,
      total_questions: totalQuestions,
      correct_answers: correctAnswers,
      time_taken: timeUsed,
      completed_at: new Date().toISOString(),
      answers: answers || {},
      performance: {
        accuracy: score,
        speed: Math.round(totalQuestions / (timeUsed / 60)), // questions per minute
        efficiency: Math.round((correctAnswers / timeUsed) * 100)
      }
    };

    console.log('✅ Quiz submission processed successfully');

    return NextResponse.json({
      success: true,
      message: 'Quiz submitted successfully',
      result: mockResult
    });
  } catch (error) {
    console.error('❌ Quiz submission error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Quiz submission failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 400 });
  }
} 