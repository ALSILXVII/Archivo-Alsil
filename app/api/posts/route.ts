import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const postsDirectory = path.join(process.cwd(), 'content', 'posts');

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// GET - List all posts
export async function GET() {
  try {
    if (!fs.existsSync(postsDirectory)) {
      return NextResponse.json([]);
    }
    const fileNames = fs.readdirSync(postsDirectory).filter(f => f.endsWith('.md'));
    const posts = fileNames.map(fileName => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const matter = require('gray-matter');
      const { data, content } = matter(fileContents);
      return { ...data, slug, content, tags: data.tags || [], featured: !!data.featured };
    });
    return NextResponse.json(posts);
  } catch {
    return NextResponse.json({ error: 'Error al leer posts' }, { status: 500 });
  }
}

// POST - Create a new post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, heading, date, category, tags, type, excerpt, cover, featured, content } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Título y contenido son requeridos' }, { status: 400 });
    }

    const slug = slugify(title);
    const fileName = `${slug}.md`;
    const fullPath = path.join(postsDirectory, fileName);

    // Check if file already exists
    if (fs.existsSync(fullPath)) {
      return NextResponse.json({ error: 'Ya existe un post con ese título' }, { status: 409 });
    }

    // Build frontmatter
    const frontmatter = [
      '---',
      `title: "${title}"`,
      heading ? `heading: "${heading}"` : null,
      `date: "${date || new Date().toISOString().split('T')[0]}"`,
      `category: "${category || 'general'}"`,
      `tags: [${(tags || []).map((t: string) => `"${t}"`).join(', ')}]`,
      `type: "${type || 'article'}"`,
      `excerpt: "${excerpt || ''}"`,
      `cover: "${cover || ''}"`,
      `featured: ${featured || false}`,
      '---',
    ].filter(Boolean).join('\n');

    const fileContent = `${frontmatter}\n\n${heading ? `# ${heading}\n\n` : ''}${content}`;

    // Ensure directory exists
    if (!fs.existsSync(postsDirectory)) {
      fs.mkdirSync(postsDirectory, { recursive: true });
    }

    fs.writeFileSync(fullPath, fileContent, 'utf8');

    return NextResponse.json({ success: true, slug, message: 'Post creado exitosamente' }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Error al crear el post' }, { status: 500 });
  }
}

// PUT - Update an existing post
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, title, heading, date, category, tags, type, excerpt, cover, featured, content } = body;

    if (!slug || !title || !content) {
      return NextResponse.json({ error: 'Slug, título y contenido son requeridos' }, { status: 400 });
    }

    const fullPath = path.join(postsDirectory, `${slug}.md`);

    if (!fs.existsSync(fullPath)) {
      return NextResponse.json({ error: 'Post no encontrado' }, { status: 404 });
    }

    const frontmatter = [
      '---',
      `title: "${title}"`,
      heading ? `heading: "${heading}"` : null,
      `date: "${date || new Date().toISOString().split('T')[0]}"`,
      `category: "${category || 'general'}"`,
      `tags: [${(tags || []).map((t: string) => `"${t}"`).join(', ')}]`,
      `type: "${type || 'article'}"`,
      `excerpt: "${excerpt || ''}"`,
      `cover: "${cover || ''}"`,
      `featured: ${featured || false}`,
      '---',
    ].filter(Boolean).join('\n');

    const fileContent = `${frontmatter}\n\n${heading ? `# ${heading}\n\n` : ''}${content}`;
    fs.writeFileSync(fullPath, fileContent, 'utf8');

    return NextResponse.json({ success: true, slug, message: 'Post actualizado exitosamente' });
  } catch {
    return NextResponse.json({ error: 'Error al actualizar el post' }, { status: 500 });
  }
}

// DELETE - Delete a post
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ error: 'Slug es requerido' }, { status: 400 });
    }

    const fullPath = path.join(postsDirectory, `${slug}.md`);

    if (!fs.existsSync(fullPath)) {
      return NextResponse.json({ error: 'Post no encontrado' }, { status: 404 });
    }

    fs.unlinkSync(fullPath);
    return NextResponse.json({ success: true, message: 'Post eliminado exitosamente' });
  } catch {
    return NextResponse.json({ error: 'Error al eliminar el post' }, { status: 500 });
  }
}
