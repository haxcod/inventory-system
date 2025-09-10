import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth';
import { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // Clear auth cookie
    clearAuthCookie(request);

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Logout successful',
    });

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Internal server error',
    }, { status: 500 });
  }
}

