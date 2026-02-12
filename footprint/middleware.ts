import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Security headers applied to all responses
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    `img-src 'self' data: blob: https://*.supabase.co https://images.footprint.co.il https://images.unsplash.com https://picsum.photos`,
    "connect-src 'self' https://*.supabase.co https://api.replicate.com https://api.payplus.co.il",
    "frame-src 'self' https://*.payplus.co.il",
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
};

function applySecurityHeaders(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }
  return response;
}

export async function middleware(request: NextRequest) {
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isAuthCallback = request.nextUrl.pathname.startsWith('/auth/callback');

  // Skip Supabase auth for non-admin, non-auth-callback routes (performance optimization)
  if (!isAdminRoute && !isAuthCallback) {
    const response = NextResponse.next({
      request: { headers: request.headers },
    });
    return applySecurityHeaders(response);
  }

  // Auth callback and admin routes: full Supabase cookie handling
  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // For auth callback, just ensure cookies are handled — no access control
  if (isAuthCallback) {
    return applySecurityHeaders(response);
  }

  // Admin routes: require authenticated user with admin role
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const redirect = NextResponse.redirect(new URL('/login', request.url));
    return applySecurityHeaders(redirect);
  }

  const userRole = user.user_metadata?.role;
  if (userRole !== 'admin') {
    const redirect = NextResponse.redirect(new URL('/', request.url));
    return applySecurityHeaders(redirect);
  }

  return applySecurityHeaders(response);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - Public assets (images, fonts)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2)).*)',
  ],
};
