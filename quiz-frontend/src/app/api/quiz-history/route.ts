import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenant_id = searchParams.get('tenant_id');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Clear quiz history for new users
    // History will be populated as users actually take quizzes
    const history: Array<{
      quiz_id: string;
      topic: string;
      score: number;
      total_questions: number;
      percentage: number;
      grade: string;
      time_taken: number;
      completed_at: string;
      quiz_title: string;
    }> = [];

    return NextResponse.json({
      success: true,
      history: history,
      total_count: 0
    });
  } catch (error) {
    console.error('Error fetching quiz history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz history' },
      { status: 500 }
    );
  }
} 