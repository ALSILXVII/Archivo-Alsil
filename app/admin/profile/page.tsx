'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

type ProfileSlide = {
  id: string;
  src: string;
  type: 'image' | 'video';
  caption: string;
  order: number;
};

type ProfileData = {
  name: string;
  subtitle: string;
  bio: string;
  slides: ProfileSlide[];
};

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<ProfileData>({ name: '', subtitle: '', bio: '', slides: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [textDirty, setTextDirty] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        if (!data.error) setProfile(data);
      }
    } catch {
      showMsg('Error al cargar perfil', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const showMsg = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  // Save text fields
  const saveText = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profile.name, subtitle: profile.subtitle, bio: profile.bio }),
      });
      if (res.ok) {
        showMsg('Texto guardado', 'success');
        setTextDirty(false);
      } else showMsg('Error al guardar', 'error');
    } catch {
      showMsg('Error de red', 'error');
    }
    setSaving(false);
  };

  // Upload files
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
          showMsg(uploadData.error || 'Error al subir', 'error');
          continue;
        }

        const isVid = file.type.startsWith('video/');
        const res = await fetch('/api/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ src: uploadData.url, type: isVid ? 'video' : 'image', caption: '' }),
        });

        if (res.ok) {
          const newSlide = await res.json();
          setProfile(prev => ({ ...prev, slides: [...prev.slides, newSlide] }));
          showMsg(`${isVid ? 'Video' : 'Imagen'} añadida`, 'success');
        }
      } catch {
        showMsg('Error de red', 'error');
      }
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Delete slide
  const deleteSlide = async (id: string) => {
    if (!confirm('¿Eliminar este slide?')) return;
    try {
      const res = await fetch(`/api/profile?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProfile(prev => ({ ...prev, slides: prev.slides.filter(s => s.id !== id) }));
        showMsg('Slide eliminado', 'success');
      }
    } catch {
      showMsg('Error al eliminar', 'error');
    }
  };

  // Update slide caption
  const updateCaption = (id: string, caption: string) => {
    setProfile(prev => ({
      ...prev,
      slides: prev.slides.map(s => s.id === id ? { ...s, caption } : s),
    }));
  };

  // Save slide caption
  const saveSlide = async (slide: ProfileSlide) => {
    setSaving(true);
    try {
      const updated = { ...profile, slides: profile.slides };
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (res.ok) showMsg('Caption guardado', 'success');
      else showMsg('Error al guardar', 'error');
    } catch {
      showMsg('Error de red', 'error');
    }
    setSaving(false);
  };

  // Reorder
  const moveSlide = async (index: number, dir: -1 | 1) => {
    const newIdx = index + dir;
    if (newIdx < 0 || newIdx >= profile.slides.length) return;
    const reordered = [...profile.slides];
    [reordered[index], reordered[newIdx]] = [reordered[newIdx], reordered[index]];
    const ordered = reordered.map((s, i) => ({ ...s, order: i }));
    setProfile(prev => ({ ...prev, slides: ordered }));

    try {
      await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...profile, slides: ordered }),
      });
    } catch {
      showMsg('Error al reordenar', 'error');
    }
  };

  // Replace media
  const replaceMedia = (slideId: string) => {
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
          const isVid = file.type.startsWith('video/');
          const updatedSlides = profile.slides.map(s =>
            s.id === slideId ? { ...s, src: uploadData.url, type: (isVid ? 'video' : 'image') as 'image' | 'video' } : s
          );
          setProfile(prev => ({ ...prev, slides: updatedSlides }));
          await fetch('/api/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...profile, slides: updatedSlides }),
          });
          showMsg('Media reemplazada', 'success');
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
            <Link href="/admin" className="text-zinc-400 hover:text-amber-400 text-sm transition">← Panel Admin</Link>
            <Link href="/" className="text-zinc-400 hover:text-amber-400 text-sm transition">Ver sitio</Link>
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
            <h1 className="text-2xl font-bold">Mi Presentación</h1>
            <p className="text-zinc-500 text-sm mt-1">Edita el banner personal que aparece en la página principal.</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-zinc-500">Cargando...</div>
        ) : (
          <div className="space-y-8">
            {/* Text fields */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
              <h2 className="text-sm font-semibold text-amber-200/70 uppercase tracking-widest">Información</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Nombre</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={e => { setProfile(p => ({ ...p, name: e.target.value })); setTextDirty(true); }}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-emerald-700/50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Subtítulo</label>
                  <input
                    type="text"
                    value={profile.subtitle}
                    onChange={e => { setProfile(p => ({ ...p, subtitle: e.target.value })); setTextDirty(true); }}
                    placeholder="Ej: Estudiante de Ingeniería"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-700/50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Bio (opcional)</label>
                <textarea
                  value={profile.bio}
                  onChange={e => { setProfile(p => ({ ...p, bio: e.target.value })); setTextDirty(true); }}
                  rows={2}
                  placeholder="Una breve descripción sobre ti..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-700/50 resize-none"
                />
              </div>
              {textDirty && (
                <button
                  onClick={saveText}
                  disabled={saving}
                  className="px-4 py-2 bg-emerald-600/80 text-white text-xs font-semibold rounded-lg hover:bg-emerald-500 transition disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : '💾 Guardar texto'}
                </button>
              )}
            </div>

            {/* Slides */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-amber-200/70 uppercase tracking-widest">Fotos y Videos</h2>
                <label className="px-4 py-2 rounded-lg bg-emerald-600/90 text-white font-semibold hover:bg-emerald-500 transition text-sm cursor-pointer">
                  {uploading ? 'Subiendo...' : '+ Subir'}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>

              {profile.slides.length === 0 ? (
                <div className="text-center py-12 bg-zinc-900 border border-zinc-800 border-dashed rounded-2xl">
                  <div className="text-4xl mb-3">📸</div>
                  <p className="text-zinc-500 text-sm">Sube fotos o videos tuyos para el banner personal.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {profile.slides.map((slide, index) => (
                    <div key={slide.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden group/card hover:border-zinc-700 transition">
                      {/* Preview */}
                      <div className="relative aspect-[4/5] bg-zinc-800 group/media">
                        {slide.type === 'video' ? (
                          <video
                            src={slide.src}
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                            onMouseEnter={e => (e.target as HTMLVideoElement).play()}
                            onMouseLeave={e => { const v = e.target as HTMLVideoElement; v.pause(); v.currentTime = 0; }}
                          />
                        ) : (
                          <img src={slide.src} alt={slide.caption || `Slide ${index + 1}`} className="w-full h-full object-cover" />
                        )}
                        <span className={`absolute top-2 left-2 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          slide.type === 'video' ? 'bg-red-500/80 text-white' : 'bg-blue-500/80 text-white'
                        }`}>
                          {slide.type === 'video' ? '▶' : '🖼'}
                        </span>
                        <span className="absolute top-2 right-2 text-[10px] font-bold bg-zinc-950/70 text-zinc-300 px-1.5 py-0.5 rounded">
                          #{index + 1}
                        </span>
                        <button
                          onClick={() => replaceMedia(slide.id)}
                          className="absolute bottom-2 left-2 text-[10px] bg-zinc-950/70 text-zinc-300 hover:text-white px-2 py-1 rounded opacity-0 group-hover/media:opacity-100 transition"
                        >
                          Reemplazar
                        </button>
                      </div>

                      {/* Controls */}
                      <div className="p-3 space-y-2">
                        <input
                          type="text"
                          value={slide.caption}
                          onChange={e => updateCaption(slide.id, e.target.value)}
                          placeholder="Caption (ej: Yo en el lab)"
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-700/50"
                          onBlur={() => saveSlide(slide)}
                        />
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => moveSlide(index, -1)} disabled={index === 0} className="px-2 py-1 border border-zinc-700 text-zinc-400 text-xs rounded hover:bg-zinc-800 transition disabled:opacity-30">←</button>
                          <button onClick={() => moveSlide(index, 1)} disabled={index === profile.slides.length - 1} className="px-2 py-1 border border-zinc-700 text-zinc-400 text-xs rounded hover:bg-zinc-800 transition disabled:opacity-30">→</button>
                          <div className="flex-1" />
                          <button onClick={() => deleteSlide(slide.id)} className="px-2 py-1 border border-red-900 text-red-400 text-xs rounded hover:bg-red-900/30 transition">✕</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
