import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User, AuthTokens } from '@/types';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'your-super-secret-refresh-key';

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

export const generateTokens = (user: User): AuthTokens => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { id: user.id, email: user.email },
    REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch (error) {
    throw new Error('Invalid access token');
  }
};

export const verifyRefreshToken = (token: string) => {
  try {
    return jwt.verify(token, REFRESH_SECRET) as any;
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

export const verifyToken = async (req: NextRequest): Promise<{ id: string; email: string } | null> => {
  try {
    const authHeader = req.headers.get('authorization') ?? '';
    if (!authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token) as { id: string; email: string };

    return {
      id: decoded.id,
      email: decoded.email,
    };
  } catch (error) {
    // Log and return null to allow callers to respond with 401
    console.error('Token verification error:', error);
    return null;
  }
};