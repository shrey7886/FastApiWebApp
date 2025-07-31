import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({
        status: 'error',
        message: 'OpenAI API key not configured',
        hasKey: false
      });
    }

    // Test the API key with a simple request
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (response.ok) {
      return NextResponse.json({
        status: 'success',
        message: 'OpenAI API key is valid and working',
        hasKey: true,
        keyPrefix: apiKey.substring(0, 10) + '...'
      });
    } else {
      return NextResponse.json({
        status: 'error',
        message: 'OpenAI API key is invalid',
        hasKey: true,
        keyPrefix: apiKey.substring(0, 10) + '...',
        error: response.statusText
      });
    }
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Failed to test OpenAI API',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 