import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, tenant_id } = body;

    // Validate input
    if (!email || !password || !tenant_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // For Vercel deployment, we'll use a simple authentication
    // In production, you'd verify against a database
    
    const user = {
      id: Date.now().toString(),
      email,
      first_name: 'User',
      last_name: 'Name',
      tenant_id,
      last_login: new Date().toISOString()
    };

    // Generate a simple token (in production, use JWT)
    const token = btoa(JSON.stringify({ userId: user.id, email }));

    return NextResponse.json({
      user,
      access_token: token,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    );
  }
} 