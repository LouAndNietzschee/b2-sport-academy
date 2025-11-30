import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminCredentials, generateToken } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Get IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 
                request.headers.get('x-real-ip') || 
                'unknown';

    // Check rate limit
    const rateLimitResult = checkRateLimit(`login_${ip}`);
    if (!rateLimitResult.allowed) {
      const resetDate = new Date(rateLimitResult.resetTime);
      return NextResponse.json(
        { 
          error: 'Çok fazla başarısız giriş denemesi. Lütfen daha sonra tekrar deneyin.',
          resetTime: resetDate.toISOString()
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { username, password } = body;

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Kullanıcı adı ve şifre gereklidir.' },
        { status: 400 }
      );
    }

  // Verify credentials
  const result = await verifyAdminCredentials(username, password);
  
  if (!result.valid || !result.role) {
      return NextResponse.json(
        { 
          error: 'Geçersiz kullanıcı adı veya şifre.',
          remaining: rateLimitResult.remaining
        },
        { status: 401 }
      );
  }

  // Generate JWT token with role
  const token = await generateToken(username, result.role);

    // Create response with secure cookie
    const response = NextResponse.json(
      { 
        success: true, 
        message: 'Giriş başarılı!',
        user: { username, role: 'admin' }
      },
      { status: 200 }
    );

    // Set secure HTTP-only cookie
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu. Lütfen tekrar deneyin.' },
      { status: 500 }
    );
  }
}
