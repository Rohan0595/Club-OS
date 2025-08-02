import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if user is authenticated
  const isAuthenticated = request.cookies.get('isAuthenticated')?.value === 'true'
  
  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard']
  
  // Auth routes that should redirect to dashboard if already authenticated
  const authRoutes = ['/auth/login', '/auth/signup']
  
  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  
  // Check if the current path is an auth route
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))
  
  // If trying to access protected route without authentication, redirect to login
  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
  
  // If trying to access auth routes while already authenticated, redirect to dashboard
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/auth/:path*'
  ]
} 