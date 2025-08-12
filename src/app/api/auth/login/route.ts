import { NextRequest, NextResponse } from 'next/server';
import { generateTokens, comparePassword } from '@/lib/auth';
import { LoginRequest } from '@/types';
import { findUserByEmail } from '@/lib/database';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { email, password }: LoginRequest = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    if (!user.password) {
      throw new Error('User record is missing password');
    }
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const { password: _pw, ...userWithoutPassword } = user;
    const tokens = generateTokens(userWithoutPassword);

    const response = NextResponse.json({
      success: true,
      data: { user: userWithoutPassword, accessToken: tokens.accessToken }
    });

    response.cookies.set('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}