import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, first_name, last_name, tenant_id } = body;

    // Validate input
    if (!email || !password || !first_name || !last_name || !tenant_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // For Vercel deployment, we'll use a simple user creation
    // In production, you'd hash the password and store in a database
    
    const user = {
      id: Date.now().toString(),
      email,
      first_name,
      last_name,
      tenant_id,
      created_at: new Date().toISOString()
    };

    // Generate a simple token (in production, use JWT)
    const token = btoa(JSON.stringify({ userId: user.id, email }));

    return NextResponse.json({
      user,
      access_token: token,
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
} 