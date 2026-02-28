import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No se envió ningún archivo' }, { status: 400 });
    }

    // Validate file type (SVG excluded - can contain malicious JavaScript)
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm', 'video/ogg'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de archivo no permitido. Solo imágenes (jpg, png, gif, webp) y videos (mp4, webm, ogg).' },
        { status: 400 }
      );
    }

    // Max file size: 50MB
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'El archivo es demasiado grande (máx 50MB)' }, { status: 400 });
    }

    // Ensure uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const ext = path.extname(file.name);
    const baseName = path.basename(file.name, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const timestamp = Date.now();
    const fileName = `${baseName}-${timestamp}${ext}`;
    const filePath = path.join(uploadsDir, fileName);

    // Write file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    fs.writeFileSync(filePath, buffer);

    const url = `/uploads/${fileName}`;
    const isVideo = file.type.startsWith('video/');

    return NextResponse.json({
      success: true,
      url,
      fileName,
      type: isVideo ? 'video' : 'image',
      size: file.size,
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Error al subir archivo' }, { status: 500 });
  }
}

// GET - List uploaded files
export async function GET() {
  try {
    if (!fs.existsSync(uploadsDir)) {
      return NextResponse.json([]);
    }
    const files = fs.readdirSync(uploadsDir)
      .filter(f => !f.startsWith('.'))
      .map(fileName => {
        const filePath = path.join(uploadsDir, fileName);
        const stats = fs.statSync(filePath);
        const ext = path.extname(fileName).toLowerCase();
        const isVideo = ['.mp4', '.webm', '.ogg'].includes(ext);
        return {
          fileName,
          url: `/uploads/${fileName}`,
          type: isVideo ? 'video' : 'image',
          size: stats.size,
          modified: stats.mtime,
        };
      });
    return NextResponse.json(files);
  } catch {
    return NextResponse.json({ error: 'Error al listar archivos' }, { status: 500 });
  }
}
