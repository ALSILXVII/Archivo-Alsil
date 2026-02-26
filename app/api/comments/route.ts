import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const commentsDir = path.join(process.cwd(), 'content', 'comments');

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
  const slug = searchParams.get('slug');

  if (!slug) {
    return NextResponse.json({ error: 'Slug es requerido' }, { status: 400 });
  }

  const comments = readComments(slug);
  return NextResponse.json(comments);
}

// POST - Add a comment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, author, content, parentId } = body;

    if (!slug || !author?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: 'Slug, autor y contenido son requeridos' },
        { status: 400 }
      );
    }

    if (author.trim().length > 50) {
      return NextResponse.json({ error: 'El nombre es demasiado largo (máx. 50 caracteres)' }, { status: 400 });
    }

    if (content.trim().length > 2000) {
      return NextResponse.json({ error: 'El comentario es demasiado largo (máx. 2000 caracteres)' }, { status: 400 });
    }

    const comments = readComments(slug);

    const newComment: Comment = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      author: author.trim(),
      content: content.trim(),
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
    const slug = searchParams.get('slug');
    const id = searchParams.get('id');

    if (!slug || !id) {
      return NextResponse.json({ error: 'Slug e ID son requeridos' }, { status: 400 });
    }

    const comments = readComments(slug);
    const filtered = comments.filter(c => c.id !== id && c.parentId !== id);
    writeComments(slug, filtered);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Error al eliminar comentario' }, { status: 500 });
  }
}
