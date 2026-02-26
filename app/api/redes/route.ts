import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataFile = path.join(process.cwd(), 'content', 'redes.json');

export type SocialLink = {
  id: string;
  name: string;
  url: string;
  description: string;
  enabled: boolean;
  order: number;
};

const defaultLinks: SocialLink[] = [
  { id: 'twitter', name: 'X (Twitter)', url: '', description: 'Opiniones y debates en tiempo real', enabled: true, order: 0 },
  { id: 'instagram', name: 'Instagram', url: '', description: 'Contenido visual y stories', enabled: true, order: 1 },
  { id: 'youtube', name: 'YouTube', url: '', description: 'Videos, análisis y ensayos', enabled: true, order: 2 },
  { id: 'tiktok', name: 'TikTok', url: '', description: 'Clips cortos y tendencias', enabled: true, order: 3 },
  { id: 'spotify', name: 'Spotify', url: '', description: 'Playlists y podcast', enabled: true, order: 4 },
  { id: 'threads', name: 'Threads', url: '', description: 'Conversaciones y comunidad', enabled: true, order: 5 },
];

function readData(): SocialLink[] {
  if (!fs.existsSync(dataFile)) {
    return defaultLinks;
  }
  try {
    const raw = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    return Array.isArray(raw) ? raw : defaultLinks;
  } catch {
    return defaultLinks;
  }
}

function writeData(data: SocialLink[]) {
  const dir = path.dirname(dataFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf8');
}

// GET - Obtener todas las redes
export async function GET() {
  const links = readData().sort((a, b) => a.order - b.order);
  return NextResponse.json(links);
}

// PUT - Actualizar todas las redes (array completo)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: 'Se espera un array' }, { status: 400 });
    }
    const links: SocialLink[] = body.map((item: SocialLink, i: number) => ({
      id: item.id || `social-${Date.now()}-${i}`,
      name: item.name || '',
      url: item.url || '',
      description: item.description || '',
      enabled: item.enabled !== undefined ? item.enabled : true,
      order: item.order !== undefined ? item.order : i,
    }));
    writeData(links);
    return NextResponse.json(links);
  } catch {
    return NextResponse.json({ error: 'Error al actualizar redes' }, { status: 500 });
  }
}
