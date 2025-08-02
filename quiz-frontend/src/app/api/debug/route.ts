import { NextRequest, NextResponse } from 'next/server';
import { quizStorageHelpers } from '@/lib/quiz-storage';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    console.log('🔍 Debug endpoint called with action:', action);

    switch (action) {
      case 'storage':
        // Show all stored quizzes
        const allQuizzes = quizStorageHelpers.getAllQuizzes();
        return NextResponse.json({
          success: true,
          message: 'Quiz storage status',
          total_quizzes: allQuizzes.length,
          quizzes: allQuizzes.map(q => ({
            id: q.id,
            title: q.title,
            topic: q.topic,
            questions_count: q.questions?.length || 0,
            created_at: q.created_at
          }))
        });

      case 'clear':
        // Clear all stored quizzes
        quizStorageHelpers.clearAll();
        return NextResponse.json({
          success: true,
          message: 'All quizzes cleared from storage'
        });

      case 'health':
        // Health check for all endpoints
        const endpoints = [
          '/api/generate-quiz',
          '/api/quizzes/test-id',
          '/api/submit-quiz',
          '/api/results/test-id',
          '/api/chatbot',
          '/api/analytics/user',
          '/api/quiz-history',
          '/api/question-history'
        ];

        return NextResponse.json({
          success: true,
          message: 'Debug health check',
          storage_status: {
            total_quizzes: quizStorageHelpers.getAllQuizzes().length,
            storage_available: true
          },
          endpoints: endpoints,
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json({
          success: true,
          message: 'Debug endpoint available',
          actions: ['storage', 'clear', 'health'],
          usage: 'Add ?action=storage|clear|health to see different debug info'
        });
    }
  } catch (error) {
    console.error('❌ Debug endpoint error:', error);
    return NextResponse.json({
      success: false,
      message: 'Debug endpoint error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 