import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataFile = path.join(process.cwd(), 'content', 'profile-slides.json');

export type ProfileSlide = {
  id: string;
  src: string;
  type: 'image' | 'video';
  caption: string;
  order: number;
};

export type ProfileData = {
  name: string;
  subtitle: string;
  bio: string;
  slides: ProfileSlide[];
};

const defaultData: ProfileData = {
  name: 'Miguel Ángel Álvarez Silva',
  subtitle: 'Estudiante de Ingeniería · Creador de Archivo ALSIL',
  bio: '',
  slides: [],
};

function readData(): ProfileData {
  if (!fs.existsSync(dataFile)) {
    return defaultData;
  }
  try {
    const raw = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    return { ...defaultData, ...raw };
  } catch {
    return defaultData;
  }
}

function writeData(data: ProfileData) {
  const dir = path.dirname(dataFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf8');
}

// GET - Obtener datos del perfil y slides
export async function GET() {
  try {
    const data = readData();
    data.slides.sort((a, b) => a.order - b.order);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Error al leer perfil' }, { status: 500 });
  }
}

// PUT - Actualizar datos del perfil (texto y/o slides)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const current = readData();

    if (body.name !== undefined) current.name = body.name.trim();
    if (body.subtitle !== undefined) current.subtitle = body.subtitle.trim();
    if (body.bio !== undefined) current.bio = body.bio.trim();
    if (Array.isArray(body.slides)) {
      current.slides = body.slides.map((s: ProfileSlide, i: number) => ({ ...s, order: i }));
    }

    writeData(current);
    return NextResponse.json(current);
  } catch {
    return NextResponse.json({ error: 'Error al actualizar perfil' }, { status: 500 });
  }
}

// POST - Añadir un slide al perfil
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { src, type, caption } = body;

    if (!src?.trim()) {
      return NextResponse.json({ error: 'La URL del archivo es requerida' }, { status: 400 });
    }

    const data = readData();

    const newSlide: ProfileSlide = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      src: src.trim(),
      type: type || ((/\.(mp4|webm|ogg|mov)$/i.test(src)) ? 'video' : 'image'),
      caption: caption?.trim() || '',
      order: data.slides.length,
    };

    data.slides.push(newSlide);
    writeData(data);

    return NextResponse.json(newSlide, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Error al añadir slide' }, { status: 500 });
  }
}

// DELETE - Eliminar un slide del perfil
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID es requerido' }, { status: 400 });
    }

    const data = readData();
    data.slides = data.slides.filter(s => s.id !== id).map((s, i) => ({ ...s, order: i }));
    writeData(data);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Error al eliminar slide' }, { status: 500 });
  }
}
