import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { generateQuizQuestions } from '@/lib/quiz-generator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, difficulty, num_questions, duration, tenant_id } = body;

    // Validate input
    if (!topic || !difficulty || !num_questions || !duration || !tenant_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate quiz using AI
    const questions = await generateQuizQuestions(topic, difficulty, num_questions);

    // Create quiz object
    const quiz = {
      id: Date.now().toString(),
      title: `${topic} Quiz`,
      description: `A ${difficulty} quiz about ${topic}`,
      topic,
      difficulty,
      num_questions,
      duration,
      tenant_id,
      questions,
      created_at: new Date().toISOString()
    };

    return NextResponse.json(quiz);
  } catch (error) {
    console.error('Quiz generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate quiz' },
      { status: 500 }
    );
  }
} 