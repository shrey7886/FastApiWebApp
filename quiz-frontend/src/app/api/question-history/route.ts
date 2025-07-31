import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenant_id = searchParams.get('tenant_id');
    const topic = searchParams.get('topic');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Mock question history data for demo purposes
    // In production, you would fetch from a database
    const questionHistory = [
      {
        question_id: 1,
        question_text: 'What is the capital of France?',
        topic_name: 'Geography',
        difficulty_level: 'easy',
        user_answer: 'Paris',
        correct_answer: 'Paris',
        is_correct: true,
        time_taken_seconds: 15,
        answered_at: '2024-01-15T10:30:00Z',
        quiz_id: 1
      },
      {
        question_id: 2,
        question_text: 'Which planet is closest to the Sun?',
        topic_name: 'Science',
        difficulty_level: 'medium',
        user_answer: 'Venus',
        correct_answer: 'Mercury',
        is_correct: false,
        time_taken_seconds: 25,
        answered_at: '2024-01-14T14:20:00Z',
        quiz_id: 2
      },
      {
        question_id: 3,
        question_text: 'What is 2 + 2?',
        topic_name: 'Mathematics',
        difficulty_level: 'easy',
        user_answer: '4',
        correct_answer: '4',
        is_correct: true,
        time_taken_seconds: 8,
        answered_at: '2024-01-13T09:15:00Z',
        quiz_id: 3
      },
      {
        question_id: 4,
        question_text: 'Who painted the Mona Lisa?',
        topic_name: 'History',
        difficulty_level: 'medium',
        user_answer: 'Leonardo da Vinci',
        correct_answer: 'Leonardo da Vinci',
        is_correct: true,
        time_taken_seconds: 20,
        answered_at: '2024-01-12T16:45:00Z',
        quiz_id: 4
      },
      {
        question_id: 5,
        question_text: 'What is the largest ocean on Earth?',
        topic_name: 'Geography',
        difficulty_level: 'easy',
        user_answer: 'Atlantic Ocean',
        correct_answer: 'Pacific Ocean',
        is_correct: false,
        time_taken_seconds: 18,
        answered_at: '2024-01-11T11:30:00Z',
        quiz_id: 5
      }
    ];

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