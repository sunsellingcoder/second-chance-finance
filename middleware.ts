import { updateSession } from '@/lib/supabase/middleware';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Update session using Supabase middleware
  const response = await updateSession(request);

  // Guard protected routes
  const protectedRoutes = ['/dashboard', '/timeline', '/chat'];
  const isProtectedRoute = protectedRoutes.some((route) => 
    request.nextUrl.pathname.startsWith(route)
  );

  // For now, we'll allow access to timeline and chat for demo purposes
  // In production, you would check for authentication here
  // if (isProtectedRoute && !user) {
  //   return NextResponse.redirect(new URL('/login', request.url));
  // }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
