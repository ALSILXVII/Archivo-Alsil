import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// La contraseña se configura en la variable de entorno ADMIN_PASSWORD
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ArchivoAlsil2026';
const TOKEN_SECRET = process.env.TOKEN_SECRET || 'alsil-secret-key-change-me';

// Store valid tokens on disk so they survive restarts
const tokensFile = path.join(process.cwd(), 'content', '.tokens.json');

function getValidTokens(): string[] {
  try {
    if (fs.existsSync(tokensFile)) {
      return JSON.parse(fs.readFileSync(tokensFile, 'utf-8'));
    }
  } catch { /* ignore */ }
  return [];
}

function saveToken(token: string) {
  const tokens = getValidTokens();
  tokens.push(token);
  // Keep only last 10 tokens (cleanup old sessions)
  const trimmed = tokens.slice(-10);
  fs.writeFileSync(tokensFile, JSON.stringify(trimmed), 'utf-8');
}

function removeToken(token: string) {
  const tokens = getValidTokens().filter(t => t !== token);
  fs.writeFileSync(tokensFile, JSON.stringify(tokens), 'utf-8');
}

async function generateToken(): Promise<string> {
  const payload = `admin:${Date.now()}:${Math.random()}:${TOKEN_SECRET}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(payload);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function validateToken(token: string): boolean {
  if (!/^[a-f0-9]{64}$/.test(token)) return false;
  // Actually verify the token was issued by us
  return getValidTokens().includes(token);
}

// Rate limiting for login: max 5 attempts per IP per 15 min
const loginAttempts = new Map<string, { count: number; resetTime: number }>();
const LOGIN_WINDOW = 15 * 60_000; // 15 minutes
const LOGIN_MAX = 5;

function isLoginRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || now > entry.resetTime) {
    loginAttempts.set(ip, { count: 1, resetTime: now + LOGIN_WINDOW });
    return false;
  }
  entry.count++;
  return entry.count > LOGIN_MAX;
}

// POST - Login
export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
    if (isLoginRateLimited(ip)) {
      return NextResponse.json({ error: 'Demasiados intentos. Intenta en 15 minutos.' }, { status: 429 });
    }

    const { password } = await req.json();

    if (password === ADMIN_PASSWORD) {
      const token = await generateToken();
      saveToken(token);

      const response = NextResponse.json({ success: true });
      response.cookies.set('admin_token', token, {
        httpOnly: true,
        secure: true,
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
export async function DELETE(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value;
  if (token) removeToken(token);
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
