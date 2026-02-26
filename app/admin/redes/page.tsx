'use client';

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';

type SocialLink = {
  id: string;
  name: string;
  url: string;
  description: string;
  enabled: boolean;
  order: number;
};

export default function AdminRedesPage() {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetch('/api/redes')
      .then(r => r.json())
      .then((data: SocialLink[]) => {
        setLinks(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/redes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(links),
      });
      if (res.ok) {
        const updated = await res.json();
        setLinks(updated);
        setMessage({ text: 'Redes guardadas correctamente', type: 'success' });
      } else {
        setMessage({ text: 'Error al guardar', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Error de red', type: 'error' });
    }
    setSaving(false);
    setTimeout(() => setMessage(null), 3000);
  };

  const updateLink = (index: number, field: keyof SocialLink, value: string | boolean) => {
    setLinks(prev => prev.map((l, i) => i === index ? { ...l, [field]: value } : l));
  };

  const moveLink = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= links.length) return;
    const updated = [...links];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setLinks(updated.map((l, i) => ({ ...l, order: i })));
  };

  const iconLabels: Record<string, string> = {
    twitter: '𝕏',
    instagram: '📷',
    youtube: '▶️',
    tiktok: '♪',
    spotify: '🎵',
    threads: '🧵',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <p className="text-zinc-500">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 py-4 px-6">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <Link href="/admin" className="text-xl font-semibold tracking-widest font-serif text-zinc-100">
            Archivo ALSIL
          </Link>
          <Link href="/admin" className="text-zinc-400 hover:text-amber-400 text-sm transition">
            ← Volver al panel
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-2">🌐 Redes Sociales</h1>
        <p className="text-zinc-500 text-sm mb-8">
          Configura los enlaces a tus redes sociales. Activa o desactiva las que quieras mostrar y agrega los links.
        </p>

        {message && (
          <div className={`p-3 rounded-lg text-sm mb-6 ${message.type === 'success' ? 'bg-green-900/40 text-green-300 border border-green-800' : 'bg-red-900/40 text-red-300 border border-red-800'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          {links.map((link, index) => (
            <div
              key={link.id}
              className={`rounded-xl border p-5 transition-all ${
                link.enabled
                  ? 'border-zinc-700/60 bg-zinc-900/40'
                  : 'border-zinc-800/30 bg-zinc-900/20 opacity-50'
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                {/* Icon label */}
                <span className="text-2xl w-8 text-center">{iconLabels[link.id] || '🔗'}</span>

                {/* Name */}
                <h3 className="text-base font-semibold text-zinc-200 flex-1">{link.name}</h3>

                {/* Reorder */}
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => moveLink(index, -1)}
                    disabled={index === 0}
                    className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 disabled:opacity-30 transition text-sm"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveLink(index, 1)}
                    disabled={index === links.length - 1}
                    className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 disabled:opacity-30 transition text-sm"
                  >
                    ↓
                  </button>
                </div>

                {/* Toggle */}
                <button
                  type="button"
                  onClick={() => updateLink(index, 'enabled', !link.enabled)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    link.enabled ? 'bg-emerald-600' : 'bg-zinc-700'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                      link.enabled ? 'left-6' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>

              {link.enabled && (
                <div className="space-y-3 pl-11">
                  {/* URL */}
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Link / URL</label>
                    <input
                      type="url"
                      value={link.url}
                      onChange={e => updateLink(index, 'url', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-emerald-600/50 transition"
                      placeholder={`https://${link.id === 'twitter' ? 'x.com/tu_usuario' : link.id + '.com/tu_perfil'}`}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Descripción</label>
                    <input
                      type="text"
                      value={link.description}
                      onChange={e => updateLink(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-emerald-600/50 transition"
                      placeholder="Breve descripción..."
                    />
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Save */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition disabled:opacity-50 mt-6"
          >
            {saving ? 'Guardando...' : '💾 Guardar configuración'}
          </button>
        </form>
      </div>
    </div>
  );
}
