import { NextRequest, NextResponse } from 'next/server';
import { verifyRefreshToken, generateTokens } from '@/lib/auth';
import { findUserById } from '@/lib/database';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, error: 'No refresh token provided' },
        { status: 401 }
      );
    }

    const decoded = verifyRefreshToken(refreshToken) as { id: string; email: string };

    const user = await findUserById(decoded.id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 401 }
      );
    }

    const { password: _pw, ...userWithoutPassword } = user;
    const tokens = generateTokens(userWithoutPassword);

    const response = NextResponse.json({
      success: true,
      data: { accessToken: tokens.accessToken }
    });

    response.cookies.set('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Invalid refresh token' },
      { status: 401 }
    );
  }
} 