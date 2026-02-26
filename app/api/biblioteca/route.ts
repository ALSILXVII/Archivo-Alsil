import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const bibliotecaDir = path.join(process.cwd(), 'public', 'uploads', 'biblioteca');
const dataFile = path.join(process.cwd(), 'content', 'biblioteca.json');

interface BibliotecaItem {
  id: string;
  title: string;
  author: string;
  description: string;
  category: string;
  tags: string[];
  fileName: string;
  originalName: string;
  url: string;
  coverUrl?: string;
  fileSize: number;
  pages?: number;
  uploadedAt: string;
}

function readData(): BibliotecaItem[] {
  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, '[]', 'utf-8');
    return [];
  }
  const raw = fs.readFileSync(dataFile, 'utf-8');
  return JSON.parse(raw);
}

function writeData(items: BibliotecaItem[]) {
  fs.writeFileSync(dataFile, JSON.stringify(items, null, 2), 'utf-8');
}

// GET - List all biblioteca items
export async function GET() {
  try {
    const items = readData();
    return NextResponse.json(items);
  } catch {
    return NextResponse.json({ error: 'Error al leer la biblioteca' }, { status: 500 });
  }
}

// POST - Upload a new PDF with metadata
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const title = formData.get('title') as string || '';
    const author = formData.get('author') as string || '';
    const description = formData.get('description') as string || '';
    const category = formData.get('category') as string || 'General';
    const tagsRaw = formData.get('tags') as string || '';
    const pagesStr = formData.get('pages') as string || '';
    const coverFile = formData.get('cover') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No se envió ningún archivo' }, { status: 400 });
    }

    // Validate PDF
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Solo se permiten archivos PDF.' },
        { status: 400 }
      );
    }

    // Max file size: 100MB
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'El archivo es demasiado grande (máx 100MB)' }, { status: 400 });
    }

    // Ensure directories exist
    if (!fs.existsSync(bibliotecaDir)) {
      fs.mkdirSync(bibliotecaDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const baseName = path.basename(file.name, '.pdf')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const fileName = `${baseName}-${timestamp}.pdf`;
    const filePath = path.join(bibliotecaDir, fileName);

    // Write PDF file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    fs.writeFileSync(filePath, buffer);

    // Handle optional cover image
    let coverUrl: string | undefined;
    if (coverFile && coverFile.size > 0) {
      const coverExt = path.extname(coverFile.name);
      const coverName = `cover-${baseName}-${timestamp}${coverExt}`;
      const coverPath = path.join(bibliotecaDir, coverName);
      const coverBytes = await coverFile.arrayBuffer();
      fs.writeFileSync(coverPath, Buffer.from(coverBytes));
      coverUrl = `/uploads/biblioteca/${coverName}`;
    }

    const tags = tagsRaw
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const id = `${baseName}-${timestamp}`;

    const item: BibliotecaItem = {
      id,
      title: title || file.name.replace('.pdf', ''),
      author,
      description,
      category,
      tags,
      fileName,
      originalName: file.name,
      url: `/uploads/biblioteca/${fileName}`,
      coverUrl,
      fileSize: file.size,
      pages: pagesStr ? parseInt(pagesStr) : undefined,
      uploadedAt: new Date().toISOString(),
    };

    const items = readData();
    items.unshift(item);
    writeData(items);

    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Error al subir el archivo' }, { status: 500 });
  }
}

// DELETE - Remove a biblioteca item
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    const items = readData();
    const item = items.find(i => i.id === id);

    if (!item) {
      return NextResponse.json({ error: 'Documento no encontrado' }, { status: 404 });
    }

    // Delete file
    const filePath = path.join(bibliotecaDir, item.fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete cover if exists
    if (item.coverUrl) {
      const coverName = path.basename(item.coverUrl);
      const coverPath = path.join(bibliotecaDir, coverName);
      if (fs.existsSync(coverPath)) {
        fs.unlinkSync(coverPath);
      }
    }

    const filtered = items.filter(i => i.id !== id);
    writeData(filtered);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Error al eliminar documento' }, { status: 500 });
  }
}
