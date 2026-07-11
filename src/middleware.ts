import type { NextRequest } from 'next/server';
import { createSupabaseMiddlewareClient } from '@/lib/supabase/middleware';

const PROTECTED_PREFIXES = ['/dashboard', '/engineer', '/admin'];
const AUTH_ROUTES = ['/login'];

export async function middleware(request: NextRequest) {
  const { supabase, supabaseResponse } = createSupabaseMiddlewareClient(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthRoute = AUTH_ROUTES.some((p) => pathname.startsWith(p));

  if (isProtected && !user) {
    // Temporarily disabled to prevent redirect loops, letting AuthGuard handle it
    // return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthRoute && user) {
    // return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // silence unused (redirect re-enable later)
  void isProtected;
  void isAuthRoute;

  return supabaseResponse;
}

export const config = {
  matcher: ['/dashboard/:path*', '/engineer/:path*', '/admin/:path*', '/login'],
};
