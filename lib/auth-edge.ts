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
    return {
      userId: payload.sub || payload.userId as string,
      email: payload.email as string,
      role: payload.role as string,
      permissions: payload.permissions as string[] || [],
      branch: payload.branch as string || ''
    } as JWTPayload;
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
