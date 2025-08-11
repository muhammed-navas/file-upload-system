import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, generateTokens } from '@/lib/auth';
import { RegisterRequest } from '@/types';
import { createUser, findUserByEmail } from '@/lib/database';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password }: RegisterRequest = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User already exists' },
        { status: 409 }
      );
    }
    
    const hashedPassword = await hashPassword(password);
    const user = await createUser({ name, email, password: hashedPassword });
    const { password: _pw, ...userWithoutPassword } = user;

    const tokens = generateTokens(userWithoutPassword);
    return NextResponse.json({
      success: true,
      data: { user: userWithoutPassword, tokens }
    });
  } catch (error: any) {
    console.error('Register API: Error occurred:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}