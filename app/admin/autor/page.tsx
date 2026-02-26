'use client';

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';

type AuthorData = {
  name: string;
  role: string;
  bio: string;
  photo: string;
  email: string;
  twitter: string;
};

export default function AdminAutorPage() {
  const [author, setAuthor] = useState<AuthorData>({
    name: '',
    role: '',
    bio: '',
    photo: '',
    email: '',
    twitter: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetch('/api/author')
      .then(r => r.json())
      .then((data: AuthorData) => {
        setAuthor(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/author', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(author),
      });
      if (res.ok) {
        setMessage({ text: 'Datos de autor guardados', type: 'success' });
      } else {
        setMessage({ text: 'Error al guardar', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Error de red', type: 'error' });
    }
    setSaving(false);
    setTimeout(() => setMessage(null), 3000);
  };

  const handlePhotoUpload = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        setAuthor(prev => ({ ...prev, photo: data.url }));
        setMessage({ text: 'Foto subida correctamente', type: 'success' });
      } else {
        setMessage({ text: 'Error al subir foto', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Error al subir foto', type: 'error' });
    }
    setUploading(false);
    setTimeout(() => setMessage(null), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <p className="text-zinc-500">Cargando...</p>
      </div>
    );
  }

  const initials = author.name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0] || '')
    .join('')
    .toUpperCase();

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
        <h1 className="text-2xl font-bold mb-2">✍️ Datos del Autor</h1>
        <p className="text-zinc-500 text-sm mb-8">
          Esta información aparecerá como firma al final de cada artículo que publiques.
        </p>

        {message && (
          <div className={`p-3 rounded-lg text-sm mb-6 ${message.type === 'success' ? 'bg-green-900/40 text-green-300 border border-green-800' : 'bg-red-900/40 text-red-300 border border-red-800'}`}>
            {message.text}
          </div>
        )}

        {/* Preview */}
        <div className="bg-zinc-900/60 rounded-xl p-6 border border-zinc-800/50 mb-8">
          <div className="text-xs text-zinc-600 uppercase tracking-widest mb-4">Vista previa</div>
          <div className="flex items-start gap-4">
            {author.photo ? (
              <img src={author.photo} alt={author.name} className="w-16 h-16 rounded-full object-cover border-2 border-emerald-700/30 shadow-lg flex-shrink-0" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-800/40 to-amber-800/30 border-2 border-emerald-700/30 flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-bold text-emerald-400/80">{initials}</span>
              </div>
            )}
            <div>
              <div className="text-[10px] uppercase tracking-widest text-amber-500/50 font-semibold mb-1">Escrito por</div>
              <h3 className="text-base font-semibold text-zinc-100">{author.name || 'Tu nombre'}</h3>
              <p className="text-xs text-emerald-600/70 mt-0.5">{author.role || 'Tu rol'}</p>
              {author.bio && <p className="text-sm text-zinc-400 mt-2 leading-relaxed">{author.bio}</p>}
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* Photo */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Foto de perfil</label>
            <div className="flex items-center gap-4">
              {author.photo ? (
                <img src={author.photo} alt="Foto" className="w-20 h-20 rounded-full object-cover border-2 border-zinc-700" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center">
                  <span className="text-2xl font-bold text-zinc-600">{initials}</span>
                </div>
              )}
              <div className="flex flex-col gap-2">
                <label className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm cursor-pointer transition border border-zinc-700">
                  {uploading ? 'Subiendo...' : '📷 Subir foto'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handlePhotoUpload(file);
                    }}
                    disabled={uploading}
                  />
                </label>
                {author.photo && (
                  <button
                    type="button"
                    onClick={() => setAuthor(prev => ({ ...prev, photo: '' }))}
                    className="text-xs text-red-400 hover:text-red-300 transition"
                  >
                    Quitar foto
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Nombre</label>
            <input
              type="text"
              value={author.name}
              onChange={e => setAuthor(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 focus:outline-none focus:border-emerald-600/50 transition"
              placeholder="Tu nombre completo"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Rol / Título</label>
            <input
              type="text"
              value={author.role}
              onChange={e => setAuthor(prev => ({ ...prev, role: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 focus:outline-none focus:border-emerald-600/50 transition"
              placeholder="Ej: Columnista · Archivo ALSIL"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Biografía corta</label>
            <textarea
              value={author.bio}
              onChange={e => setAuthor(prev => ({ ...prev, bio: e.target.value }))}
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 focus:outline-none focus:border-emerald-600/50 transition resize-none"
              placeholder="Una breve descripción sobre ti..."
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Correo (opcional)</label>
            <input
              type="email"
              value={author.email}
              onChange={e => setAuthor(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 focus:outline-none focus:border-emerald-600/50 transition"
              placeholder="tu@correo.com"
            />
          </div>

          {/* Twitter / X */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Usuario de X (opcional)</label>
            <input
              type="text"
              value={author.twitter}
              onChange={e => setAuthor(prev => ({ ...prev, twitter: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 focus:outline-none focus:border-emerald-600/50 transition"
              placeholder="@usuario"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition disabled:opacity-50"
          >
            {saving ? 'Guardando...' : '💾 Guardar datos del autor'}
          </button>
        </form>
      </div>
    </div>
  );
}
