import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const commentsDir = path.join(process.cwd(), 'content', 'comments');

// Rate limiting: max 5 comments per IP per minute
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

// Sanitize slug to prevent path traversal
function sanitizeSlug(slug: string): string | null {
  const clean = slug.replace(/[^a-zA-Z0-9_-]/g, '');
  if (!clean || clean !== slug) return null;
  return clean;
}

// Strip HTML tags to prevent XSS
function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, '').replace(/[<>]/g, '');
}

function ensureDir() {
  if (!fs.existsSync(commentsDir)) {
    fs.mkdirSync(commentsDir, { recursive: true });
  }
}

function getCommentsFile(slug: string): string {
  return path.join(commentsDir, `${slug}.json`);
}

function readComments(slug: string): Comment[] {
  const file = getCommentsFile(slug);
  if (!fs.existsSync(file)) return [];
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return [];
  }
}

function writeComments(slug: string, comments: Comment[]) {
  ensureDir();
  fs.writeFileSync(getCommentsFile(slug), JSON.stringify(comments, null, 2), 'utf8');
}

type Comment = {
  id: string;
  author: string;
  content: string;
  date: string;
  parentId: string | null;
};

// GET - Get comments for a post
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawSlug = searchParams.get('slug');

  if (!rawSlug) {
    return NextResponse.json({ error: 'Slug es requerido' }, { status: 400 });
  }

  const slug = sanitizeSlug(rawSlug);
  if (!slug) {
    return NextResponse.json({ error: 'Slug inválido' }, { status: 400 });
  }

  const comments = readComments(slug);
  return NextResponse.json(comments);
}

// POST - Add a comment
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Demasiados comentarios. Intenta en un minuto.' }, { status: 429 });
    }

    const body = await request.json();
    const { slug: rawSlug, author: rawAuthor, content: rawContent, parentId } = body;

    if (!rawSlug || !rawAuthor?.trim() || !rawContent?.trim()) {
      return NextResponse.json(
        { error: 'Slug, autor y contenido son requeridos' },
        { status: 400 }
      );
    }

    const slug = sanitizeSlug(rawSlug);
    if (!slug) {
      return NextResponse.json({ error: 'Slug inválido' }, { status: 400 });
    }

    const author = stripHtml(rawAuthor.trim());
    const content = stripHtml(rawContent.trim());

    if (author.length > 50) {
      return NextResponse.json({ error: 'El nombre es demasiado largo (máx. 50 caracteres)' }, { status: 400 });
    }

    if (content.length > 2000) {
      return NextResponse.json({ error: 'El comentario es demasiado largo (máx. 2000 caracteres)' }, { status: 400 });
    }

    if (content.length === 0 || author.length === 0) {
      return NextResponse.json({ error: 'Contenido inválido' }, { status: 400 });
    }

    const comments = readComments(slug);

    const newComment: Comment = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      author,
      content,
      date: new Date().toISOString(),
      parentId: parentId || null,
    };

    comments.push(newComment);
    writeComments(slug, comments);

    return NextResponse.json(newComment, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Error al guardar comentario' }, { status: 500 });
  }
}

// DELETE - Delete a comment
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawSlug = searchParams.get('slug');
    const id = searchParams.get('id');

    if (!rawSlug || !id) {
      return NextResponse.json({ error: 'Slug e ID son requeridos' }, { status: 400 });
    }

    const slug = sanitizeSlug(rawSlug);
    if (!slug) {
      return NextResponse.json({ error: 'Slug inválido' }, { status: 400 });
    }

    const comments = readComments(slug);
    const filtered = comments.filter(c => c.id !== id && c.parentId !== id);
    writeComments(slug, filtered);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Error al eliminar comentario' }, { status: 500 });
  }
}
