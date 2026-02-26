import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataFile = path.join(process.cwd(), 'content', 'hero-slides.json');

export type HeroSlide = {
  id: string;
  src: string;
  type: 'image' | 'video';
  title: string;
  subtitle: string;
  link: string;
  order: number;
};

function readSlides(): HeroSlide[] {
  if (!fs.existsSync(dataFile)) {
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  } catch {
    return [];
  }
}

function writeSlides(slides: HeroSlide[]) {
  const dir = path.dirname(dataFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(dataFile, JSON.stringify(slides, null, 2), 'utf8');
}

// GET - Obtener todos los slides
export async function GET() {
  try {
    const slides = readSlides().sort((a, b) => a.order - b.order);
    return NextResponse.json(slides);
  } catch {
    return NextResponse.json({ error: 'Error al leer slides' }, { status: 500 });
  }
}

// POST - Crear un nuevo slide
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { src, type, title, subtitle, link } = body;

    if (!src?.trim()) {
      return NextResponse.json({ error: 'La URL del archivo es requerida' }, { status: 400 });
    }

    const slides = readSlides();

    const newSlide: HeroSlide = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      src: src.trim(),
      type: type || ((/\.(mp4|webm|ogg|mov)$/i.test(src)) ? 'video' : 'image'),
      title: title?.trim() || '',
      subtitle: subtitle?.trim() || '',
      link: link?.trim() || '',
      order: slides.length,
    };

    slides.push(newSlide);
    writeSlides(slides);

    return NextResponse.json(newSlide, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Error al crear slide' }, { status: 500 });
  }
}

// PUT - Actualizar slides (acepta un slide individual o el array completo para reordenar)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Si es un array, reemplazar todos los slides (para reordenar)
    if (Array.isArray(body)) {
      const ordered = body.map((s: HeroSlide, i: number) => ({ ...s, order: i }));
      writeSlides(ordered);
      return NextResponse.json(ordered);
    }

    // Si es un objeto, actualizar un slide individual
    const { id, src, type, title, subtitle, link } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID es requerido' }, { status: 400 });
    }

    const slides = readSlides();
    const index = slides.findIndex(s => s.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Slide no encontrado' }, { status: 404 });
    }

    if (src !== undefined) slides[index].src = src.trim();
    if (type !== undefined) slides[index].type = type;
    if (title !== undefined) slides[index].title = title.trim();
    if (subtitle !== undefined) slides[index].subtitle = subtitle.trim();
    if (link !== undefined) slides[index].link = link.trim();

    writeSlides(slides);
    return NextResponse.json(slides[index]);
  } catch {
    return NextResponse.json({ error: 'Error al actualizar slide' }, { status: 500 });
  }
}

// DELETE - Eliminar un slide
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID es requerido' }, { status: 400 });
    }

    let slides = readSlides();
    slides = slides.filter(s => s.id !== id);
    // Re-order
    slides = slides.map((s, i) => ({ ...s, order: i }));
    writeSlides(slides);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Error al eliminar slide' }, { status: 500 });
  }
}
