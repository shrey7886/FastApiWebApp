import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, tenant_id, first_name, last_name } = body;

    // Simple mock registration for demo purposes
    // In production, you would save to a real database
    if (email && password && tenant_id) {
      // Generate a mock token
      const token = `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const user = {
        id: Date.now(),
        email: email,
        first_name: first_name || email.split('@')[0],
        last_name: last_name || '',
        tenant_id: tenant_id,
        is_active: true,
        created_at: new Date().toISOString()
      };

      return NextResponse.json({
        access_token: token,
        user: user,
        message: 'Registration successful'
      });
    } else {
      return NextResponse.json(
        { detail: 'Missing required fields' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    );
  }
} 