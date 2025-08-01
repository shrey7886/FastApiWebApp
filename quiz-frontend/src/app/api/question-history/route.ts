import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenant_id = searchParams.get('tenant_id');
    const topic = searchParams.get('topic');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Clear question history for new users
    // History will be populated as users actually take quizzes
    const questionHistory: Array<{
      question_id: number;
      question_text: string;
      topic_name: string;
      difficulty_level: string;
      user_answer: string;
      correct_answer: string;
      is_correct: boolean;
      time_taken_seconds: number;
      answered_at: string;
      quiz_id: number;
    }> = [];

    // Filter by topic if specified
    let filteredHistory = questionHistory;
    if (topic && topic !== 'all') {
      filteredHistory = questionHistory.filter(q => q.topic_name === topic);
    }

    // Limit results
    filteredHistory = filteredHistory.slice(0, limit);

    // Calculate summary statistics
    const total_answered = filteredHistory.length;
    const correct_answers = filteredHistory.filter(q => q.is_correct).length;
    const accuracy = total_answered > 0 ? (correct_answers / total_answered * 100) : 0;
    const unique_topics = Array.from(new Set(filteredHistory.map(q => q.topic_name)));

    return NextResponse.json({
      success: true,
      question_history: filteredHistory,
      summary: {
        total_questions_answered: total_answered,
        correct_answers: correct_answers,
        accuracy_percentage: Math.round(accuracy * 100) / 100,
        unique_topics: unique_topics,
        topics_count: unique_topics.length
      },
      total_count: filteredHistory.length
    });
  } catch (error) {
    console.error('Error fetching question history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch question history' },
      { status: 500 }
    );
  }
} 