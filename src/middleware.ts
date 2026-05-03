import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 1. Permitir siempre el acceso a Login y a los links públicos (slugs)
  if (pathname === '/login' || pathname.startsWith('/_next') || pathname.startsWith('/api') || !pathname.startsWith('/app')) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            request.cookies.set({ name, value, ...options });
            response = NextResponse.next({ request: { headers: request.headers } });
            response.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            request.cookies.set({ name, value: '', ...options });
            response = NextResponse.next({ request: { headers: request.headers } });
            response.cookies.set({ name, value: '', ...options });
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    // 🛡️ REGLA DE ORO: Si intenta entrar a /app sin usuario -> Expulsar a /login
    if (!user && pathname.startsWith('/app')) {
      console.log('Acceso denegado a /app. Redirigiendo a /login...');
      return NextResponse.redirect(new URL('/login', request.url));
    }

  } catch (err) {
    console.error('Error en Middleware de Seguridad:', err);
    // Si hay un error crítico de seguridad, mejor redirigir al login por precaución
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/app/:path*', '/login'],
};
