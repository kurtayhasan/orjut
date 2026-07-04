import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PREFIXES = ['/dashboard', '/engineer', '/admin'];
const AUTH_ROUTES = ['/login'];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(keysToSet) {
          keysToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          keysToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some(p => pathname.startsWith(p));
  const isAuthRoute = AUTH_ROUTES.some(p => pathname.startsWith(p));

  if (isProtected && !user) {
    // Temporarily disabled to prevent redirect loops, letting AuthGuard handle it
    // return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthRoute && user) {
    // return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/dashboard/:path*', '/engineer/:path*', '/admin/:path*', '/login'],
};
