'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

type HeroSlide = {
  id: string;
  src: string;
  type: 'image' | 'video';
  title: string;
  subtitle: string;
  link: string;
  order: number;
};

export default function AdminHeroPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchSlides = useCallback(async () => {
    try {
      const res = await fetch('/api/hero');
      if (res.ok) setSlides(await res.json());
    } catch {
      setMessage({ text: 'Error al cargar slides', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSlides(); }, [fetchSlides]);

  const showMsg = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  // Upload file and add as new slide
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
        const uploadData = await uploadRes.json();

        if (!uploadRes.ok) {
          showMsg(uploadData.error || 'Error al subir archivo', 'error');
          continue;
        }

        const isVideo = file.type.startsWith('video/');
        const res = await fetch('/api/hero', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            src: uploadData.url,
            type: isVideo ? 'video' : 'image',
            title: '',
            subtitle: '',
            link: '',
          }),
        });

        if (res.ok) {
          const newSlide = await res.json();
          setSlides(prev => [...prev, newSlide]);
          showMsg(`${isVideo ? 'Video' : 'Imagen'} añadida al banner`, 'success');
        }
      } catch {
        showMsg('Error de red al subir', 'error');
      }
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Add slide from URL
  const handleAddFromUrl = async () => {
    const url = prompt('URL de la imagen o video:');
    if (!url?.trim()) return;

    try {
      const res = await fetch('/api/hero', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ src: url.trim(), title: '', subtitle: '', link: '' }),
      });
      if (res.ok) {
        const newSlide = await res.json();
        setSlides(prev => [...prev, newSlide]);
        showMsg('Slide añadido', 'success');
      }
    } catch {
      showMsg('Error al añadir slide', 'error');
    }
  };

  // Update a slide field
  const updateSlide = (id: string, field: keyof HeroSlide, value: string) => {
    setSlides(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  // Save one slide
  const saveSlide = async (slide: HeroSlide) => {
    setSaving(true);
    try {
      const res = await fetch('/api/hero', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slide),
      });
      if (res.ok) {
        showMsg('Slide guardado', 'success');
        setEditingId(null);
      } else {
        showMsg('Error al guardar', 'error');
      }
    } catch {
      showMsg('Error de red', 'error');
    }
    setSaving(false);
  };

  // Delete a slide
  const deleteSlide = async (id: string) => {
    if (!confirm('¿Eliminar este slide?')) return;
    try {
      const res = await fetch(`/api/hero?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSlides(prev => prev.filter(s => s.id !== id));
        showMsg('Slide eliminado', 'success');
      }
    } catch {
      showMsg('Error al eliminar', 'error');
    }
  };

  // Move slide up/down
  const moveSlide = async (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= slides.length) return;

    const reordered = [...slides];
    [reordered[index], reordered[newIndex]] = [reordered[newIndex], reordered[index]];
    const ordered = reordered.map((s, i) => ({ ...s, order: i }));
    setSlides(ordered);

    try {
      await fetch('/api/hero', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ordered),
      });
    } catch {
      showMsg('Error al reordenar', 'error');
    }
  };

  // Replace media for a slide
  const handleReplaceMedia = async (slideId: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,video/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setUploading(true);

      const formData = new FormData();
      formData.append('file', file);

      try {
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
        const uploadData = await uploadRes.json();

        if (uploadRes.ok) {
          const isVideo = file.type.startsWith('video/');
          const slide = slides.find(s => s.id === slideId);
          if (slide) {
            const updated = { ...slide, src: uploadData.url, type: (isVideo ? 'video' : 'image') as 'image' | 'video' };
            await fetch('/api/hero', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updated),
            });
            setSlides(prev => prev.map(s => s.id === slideId ? updated : s));
            showMsg('Media reemplazada', 'success');
          }
        } else {
          showMsg(uploadData.error || 'Error al subir', 'error');
        }
      } catch {
        showMsg('Error de red', 'error');
      }
      setUploading(false);
    };
    input.click();
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 py-4 px-6">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-semibold tracking-widest font-serif text-zinc-100">
            Archivo ALSIL
          </Link>
          <div className="flex gap-3 items-center">
            <Link href="/admin" className="text-zinc-400 hover:text-amber-400 text-sm transition">
              ← Panel Admin
            </Link>
            <Link href="/" className="text-zinc-400 hover:text-amber-400 text-sm transition">
              Ver sitio
            </Link>
          </div>
        </div>
      </header>

      {message && (
        <div className="max-w-5xl mx-auto mt-4 px-6">
          <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-900/40 text-green-300 border border-green-800' : 'bg-red-900/40 text-red-300 border border-red-800'}`}>
            {message.text}
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Editor del Banner Principal</h1>
            <p className="text-zinc-500 text-sm mt-1">Administra las imágenes y videos del carrusel de la página principal.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddFromUrl}
              className="px-4 py-2 rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-sm transition"
            >
              + URL
            </button>
            <label className="px-4 py-2 rounded-lg bg-emerald-600/90 text-white font-semibold hover:bg-emerald-500 transition text-sm cursor-pointer">
              {uploading ? 'Subiendo...' : '+ Subir Archivo'}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-zinc-500">Cargando slides...</div>
        ) : slides.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <div className="text-6xl mb-4">🖼️</div>
            <p className="text-zinc-400 text-lg">No hay slides en el banner</p>
            <p className="text-zinc-600 text-sm">Sube imágenes o videos para crear tu carrusel.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition"
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Preview */}
                  <div className="relative sm:w-72 w-full aspect-video sm:aspect-auto shrink-0 bg-zinc-800 group/media">
                    {slide.type === 'video' ? (
                      <video
                        src={slide.src}
                        muted
                        playsInline
                        className="w-full h-full object-cover sm:h-48"
                        onMouseEnter={e => (e.target as HTMLVideoElement).play()}
                        onMouseLeave={e => { const v = e.target as HTMLVideoElement; v.pause(); v.currentTime = 0; }}
                      />
                    ) : (
                      <img
                        src={slide.src}
                        alt={slide.title || `Slide ${index + 1}`}
                        className="w-full h-full object-cover sm:h-48"
                      />
                    )}
                    {/* Type badge */}
                    <span className={`absolute top-2 left-2 text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      slide.type === 'video' ? 'bg-red-500/80 text-white' : 'bg-blue-500/80 text-white'
                    }`}>
                      {slide.type === 'video' ? '▶ Video' : '🖼 Imagen'}
                    </span>
                    {/* Order badge */}
                    <span className="absolute top-2 right-2 text-xs font-bold bg-zinc-950/70 text-zinc-300 px-2 py-0.5 rounded">
                      #{index + 1}
                    </span>
                    {/* Replace button */}
                    <button
                      onClick={() => handleReplaceMedia(slide.id)}
                      disabled={uploading}
                      className="absolute bottom-2 left-2 text-[10px] bg-zinc-950/70 text-zinc-300 hover:text-white px-2 py-1 rounded opacity-0 group-hover/media:opacity-100 transition"
                    >
                      Reemplazar
                    </button>
                  </div>

                  {/* Fields */}
                  <div className="flex-1 p-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Título</label>
                        <input
                          type="text"
                          value={slide.title}
                          onChange={e => updateSlide(slide.id, 'title', e.target.value)}
                          onFocus={() => setEditingId(slide.id)}
                          placeholder="Título del slide"
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-700/50"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Subtítulo</label>
                        <input
                          type="text"
                          value={slide.subtitle}
                          onChange={e => updateSlide(slide.id, 'subtitle', e.target.value)}
                          onFocus={() => setEditingId(slide.id)}
                          placeholder="Texto secundario"
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-700/50"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Enlace (opcional)</label>
                      <input
                        type="text"
                        value={slide.link}
                        onChange={e => updateSlide(slide.id, 'link', e.target.value)}
                        onFocus={() => setEditingId(slide.id)}
                        placeholder="/p/mi-post o https://..."
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-700/50"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-1">
                      {editingId === slide.id && (
                        <button
                          onClick={() => saveSlide(slide)}
                          disabled={saving}
                          className="px-3 py-1.5 bg-emerald-600/80 text-white text-xs font-semibold rounded-lg hover:bg-emerald-500 transition disabled:opacity-50"
                        >
                          {saving ? 'Guardando...' : '💾 Guardar'}
                        </button>
                      )}
                      <button
                        onClick={() => moveSlide(index, -1)}
                        disabled={index === 0}
                        className="px-2 py-1.5 border border-zinc-700 text-zinc-400 text-xs rounded-lg hover:bg-zinc-800 transition disabled:opacity-30"
                        title="Mover arriba"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveSlide(index, 1)}
                        disabled={index === slides.length - 1}
                        className="px-2 py-1.5 border border-zinc-700 text-zinc-400 text-xs rounded-lg hover:bg-zinc-800 transition disabled:opacity-30"
                        title="Mover abajo"
                      >
                        ↓
                      </button>
                      <div className="flex-1" />
                      <button
                        onClick={() => deleteSlide(slide.id)}
                        className="px-3 py-1.5 border border-red-900 text-red-400 text-xs rounded-lg hover:bg-red-900/30 transition"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {slides.length > 0 && (
          <div className="mt-8 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/50 text-center">
            <p className="text-zinc-500 text-xs">
              💡 Los slides se muestran en el orden que ves aquí. Usa las flechas ↑ ↓ para reordenar.
              <br />Pasa el cursor sobre un video para previsualizarlo.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
