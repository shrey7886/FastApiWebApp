import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenant_id = searchParams.get('tenant_id');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Mock quiz history data for demo purposes
    // In production, you would fetch from a database
    const history = [
      {
        quiz_id: '1',
        topic: 'Mathematics',
        score: 85,
        total_questions: 10,
        percentage: 85,
        grade: 'A',
        time_taken: 1200,
        completed_at: '2024-01-15T10:30:00Z',
        quiz_title: 'Advanced Mathematics Quiz'
      },
      {
        quiz_id: '2',
        topic: 'Science',
        score: 7,
        total_questions: 10,
        percentage: 70,
        grade: 'C',
        time_taken: 900,
        completed_at: '2024-01-14T14:20:00Z',
        quiz_title: 'General Science Quiz'
      },
      {
        quiz_id: '3',
        topic: 'History',
        score: 9,
        total_questions: 10,
        percentage: 90,
        grade: 'A',
        time_taken: 1100,
        completed_at: '2024-01-13T09:15:00Z',
        quiz_title: 'World History Quiz'
      },
      {
        quiz_id: '4',
        topic: 'Geography',
        score: 6,
        total_questions: 10,
        percentage: 60,
        grade: 'D',
        time_taken: 800,
        completed_at: '2024-01-12T16:45:00Z',
        quiz_title: 'Geography Quiz'
      },
      {
        quiz_id: '5',
        topic: 'Literature',
        score: 8,
        total_questions: 10,
        percentage: 80,
        grade: 'B',
        time_taken: 1000,
        completed_at: '2024-01-11T11:30:00Z',
        quiz_title: 'Literature Quiz'
      }
    ].slice(0, limit);

    return NextResponse.json({
      success: true,
      history: history,
      total_count: history.length
    });
  } catch (error) {
    console.error('Error fetching quiz history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz history' },
      { status: 500 }
    );
  }
} 