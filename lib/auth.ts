import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { User } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  permissions: string[];
  branch?: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

export function setAuthCookie(token: string, req?: NextRequest) {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  };

  if (req) {
    req.cookies.set({
      name: 'auth-token',
      value: token,
      ...cookieOptions
    });
  } else {
    const cookieStore = cookies();
    cookieStore.set({
      name: 'auth-token',
      value: token,
      ...cookieOptions
    });
  }
}

export function getAuthToken(req?: NextRequest): string | null {
  if (req) {
    return req.cookies.get('auth-token')?.value || null;
  }
  const cookieStore = cookies();
  return cookieStore.get('auth-token')?.value || null;
}

export function clearAuthCookie(req?: NextRequest) {
  if (req) {
    req.cookies.delete('auth-token');
  } else {
    const cookieStore = cookies();
    cookieStore.delete('auth-token');
  }
}

export function getCurrentUser(req?: NextRequest): JWTPayload | null {
  const token = getAuthToken(req);
  if (!token) return null;
  
  return verifyToken(token);
}

export function hasPermission(user: JWTPayload, permission: string): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (!permission) return false;
  if (!user.permissions || !Array.isArray(user.permissions)) return false;
  
  // Check for exact permission match
  if (user.permissions.includes(permission)) return true;
  
  // Check for wildcard permissions
  if (user.permissions.includes('read:all') && permission.startsWith('read:')) return true;
  if (user.permissions.includes('write:all') && permission.startsWith('write:')) return true;
  if (user.permissions.includes('delete:all') && permission.startsWith('delete:')) return true;
  
  return false;
}

export function hasRole(user: JWTPayload, role: string): boolean {
  if (!user || !role) return false;
  return user.role === role;
}

export function canAccessBranch(user: JWTPayload, branchId: string): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (!branchId) return false;
  return user.branch === branchId;
}
