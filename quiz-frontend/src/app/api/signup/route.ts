import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, tenant_id, first_name, last_name } = body;

    console.log('📝 Signup request received:', { email, tenant_id, first_name, last_name });

    // Mock successful signup
    const mockUser = {
      id: Date.now().toString(),
      email: email || 'user@example.com',
      first_name: first_name || 'Demo',
      last_name: last_name || 'User',
      tenant_id: tenant_id || 'default',
      created_at: new Date().toISOString()
    };

    const mockToken = `mock_token_${Date.now()}`;

    console.log('✅ Signup successful');

    return NextResponse.json({
      success: true,
      message: 'User registered successfully',
      access_token: mockToken,
      user: mockUser
    });
  } catch (error) {
    console.error('❌ Signup error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Registration failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 400 });
  }
} 