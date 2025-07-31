import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenant_id = searchParams.get('tenant_id');

    // Mock analytics data for demo purposes
    // In production, you would fetch from a database
    const analytics = {
      total_quizzes: 12,
      average_score: 78.5,
      best_score: 95.0,
      total_questions_answered: 60,
      correct_answers: 47,
      overall_accuracy: 78.3,
      quizzes_this_week: 3,
      improvement_rate: 12.5,
      topics_covered: ['Mathematics', 'Science', 'History', 'Geography', 'Literature'],
      recent_performance: [
        { date: '2024-01-15', score: 85, topic: 'Mathematics' },
        { date: '2024-01-14', score: 72, topic: 'Science' },
        { date: '2024-01-13', score: 90, topic: 'History' },
        { date: '2024-01-12', score: 78, topic: 'Geography' },
        { date: '2024-01-11', score: 82, topic: 'Literature' }
      ],
      strength_areas: ['Mathematics', 'History'],
      improvement_areas: ['Science', 'Geography'],
      study_streak: 7,
      total_study_time: 480, // minutes
      average_time_per_question: 45 // seconds
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