import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, tenant_id } = body;

    console.log('🔐 Login request received:', { email, tenant_id });

    // Mock successful login
    const mockUser = {
      id: Date.now().toString(),
      email: email || 'user@example.com',
      first_name: 'Demo',
      last_name: 'User',
      tenant_id: tenant_id || 'default',
      is_active: true,
      created_at: new Date().toISOString()
    };

    const mockToken = `mock_token_${Date.now()}`;

    console.log('✅ Login successful');

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      access_token: mockToken,
      user: mockUser
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Login failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 400 });
  }
} 