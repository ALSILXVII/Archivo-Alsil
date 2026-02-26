import { NextRequest, NextResponse } from 'next/server';

// Rutas que NO requieren autenticación
const PUBLIC_PATHS = [
  '/login',
  '/api/auth',
  '/api/comments', // comentarios son públicos
];

// Rutas de API que deben protegerse (solo mutaciones)
const PROTECTED_API_PATHS = [
  '/api/posts',
  '/api/upload',
  '/api/hero',
  '/api/profile',
  '/api/author',
  '/api/redes',
  '/api/biblioteca',
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(p => pathname.startsWith(p));
}

function isProtectedApiPath(pathname: string): boolean {
  return PROTECTED_API_PATHS.some(p => pathname.startsWith(p));
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('admin_token')?.value;
  const isAuthenticated = token && /^[a-f0-9]{64}$/.test(token);

  // 1. Proteger todas las rutas /admin/*
  if (pathname.startsWith('/admin')) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    return NextResponse.next();
  }

  // 2. Proteger APIs de mutación (POST, PUT, DELETE) excepto las públicas
  if (isProtectedApiPath(pathname) && req.method !== 'GET') {
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
  }

  // 3. Si está autenticado y visita /login, redirigir a /admin
  if (pathname === '/login' && isAuthenticated) {
    return NextResponse.redirect(new URL('/admin', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/login',
    '/api/posts/:path*',
    '/api/upload/:path*',
    '/api/hero/:path*',
    '/api/profile/:path*',
    '/api/author/:path*',
    '/api/redes/:path*',
    '/api/biblioteca/:path*',
  ],
};
