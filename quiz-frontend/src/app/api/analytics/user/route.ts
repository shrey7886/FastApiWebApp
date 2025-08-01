import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenant_id = searchParams.get('tenant_id');

    // Reset analytics data to zero for new users
    // Values will be updated as users actually take quizzes
    const analytics = {
      total_quizzes: 0,
      average_score: 0,
      best_score: 0,
      total_questions_answered: 0,
      correct_answers: 0,
      overall_accuracy: 0,
      quizzes_this_week: 0,
      improvement_rate: 0,
      topics_covered: [],
      recent_performance: [],
      strength_areas: [],
      improvement_areas: [],
      study_streak: 0,
      total_study_time: 0, // minutes
      average_time_per_question: 0 // seconds
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
} 