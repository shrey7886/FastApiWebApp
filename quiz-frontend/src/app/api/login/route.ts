import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, tenant_id } = body;

    // Simple mock authentication for demo purposes
    // In production, you would validate against a real database
    if (email && password && tenant_id) {
      // Generate a mock token
      const token = `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const user = {
        id: 1,
        email: email,
        first_name: email.split('@')[0],
        last_name: '',
        tenant_id: tenant_id,
        is_active: true
      };

      return NextResponse.json({
        access_token: token,
        user: user,
        message: 'Login successful'
      });
    } else {
      return NextResponse.json(
        { detail: 'Invalid credentials' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    );
  }
} 