import { NextRequest } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-here-make-it-long-and-random-for-development';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  permissions: string[];
  branch: string;
  iat?: number;
  exp?: number;
}

// Convert string secret to Uint8Array for jose
const getSecretKey = () => {
  return new TextEncoder().encode(JWT_SECRET);
};

export function getAuthToken(req?: NextRequest): string | null {
  if (req) {
    return req.cookies.get('auth-token')?.value || null;
  }
  return null;
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const secretKey = getSecretKey();
    const { payload } = await jwtVerify(token, secretKey);
    return payload as JWTPayload;
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser(req?: NextRequest): Promise<JWTPayload | null> {
  const token = getAuthToken(req);
  if (!token) return null;
  
  const payload = await verifyToken(token);
  return payload;
}
