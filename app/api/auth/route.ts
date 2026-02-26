import { NextRequest, NextResponse } from 'next/server';

// La contraseña se configura en la variable de entorno ADMIN_PASSWORD
// Si no está configurada, usa esta por defecto (CÁMBIALA en producción)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ArchivoAlsil2026';
const TOKEN_SECRET = process.env.TOKEN_SECRET || 'alsil-secret-key-change-me';

async function generateToken(): Promise<string> {
  const payload = `admin:${Date.now()}:${TOKEN_SECRET}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(payload);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function validateToken(token: string): boolean {
  // Token is valid if it's a 64-char hex string (sha256)
  return /^[a-f0-9]{64}$/.test(token);
}

// POST - Login
export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    if (password === ADMIN_PASSWORD) {
      const token = await generateToken();

      const response = NextResponse.json({ success: true });
      response.cookies.set('admin_token', token, {
        httpOnly: true,
        secure: false, // cambiar a true cuando tengas HTTPS
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 días
      });

      return response;
    }

    return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
  } catch {
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  }
}

// DELETE - Logout
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('admin_token');
  return response;
}

// GET - Check if authenticated
export async function GET(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value;
  if (token && validateToken(token)) {
    return NextResponse.json({ authenticated: true });
  }
  return NextResponse.json({ authenticated: false }, { status: 401 });
}
