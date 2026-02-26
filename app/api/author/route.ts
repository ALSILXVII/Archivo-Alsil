import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataFile = path.join(process.cwd(), 'content', 'author.json');

export type AuthorData = {
  name: string;
  role: string;
  bio: string;
  photo: string;
  email: string;
  twitter: string;
};

const defaultData: AuthorData = {
  name: 'Miguel Ángel Álvarez Silva',
  role: 'Columnista · Archivo ALSIL',
  bio: 'Estudiante de ingeniería, escritor y creador de Archivo ALSIL.',
  photo: '',
  email: '',
  twitter: '',
};

function readData(): AuthorData {
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

function writeData(data: AuthorData) {
  const dir = path.dirname(dataFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf8');
}

// GET - Obtener datos del autor
export async function GET() {
  return NextResponse.json(readData());
}

// PUT - Actualizar datos del autor
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const current = readData();

    const updated: AuthorData = {
      name: body.name ?? current.name,
      role: body.role ?? current.role,
      bio: body.bio ?? current.bio,
      photo: body.photo ?? current.photo,
      email: body.email ?? current.email,
      twitter: body.twitter ?? current.twitter,
    };

    writeData(updated);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Error al actualizar autor' }, { status: 500 });
  }
}
