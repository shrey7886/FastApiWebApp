import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    message: 'Quizlet AI Quiz Generator API is running',
    version: '2.0.0'
  });
} 