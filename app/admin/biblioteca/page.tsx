'use client';

import { useState, useEffect, useRef } from 'react';
import Layout from '../../../components/Layout';
import Link from 'next/link';

interface BibliotecaItem {
  id: string;
  title: string;
  author: string;
  description: string;
  category: string;
  tags: string[];
  url: string;
  coverUrl?: string;
  fileSize: number;
  pages?: number;
  uploadedAt: string;
  originalName: string;
}

const defaultCategories = [
  'Ciencia', 'Ingeniería', 'Política', 'Filosofía',
  'Historia', 'Literatura', 'Arte', 'Economía', 'General'
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminBibliotecaPage() {
  const [items, setItems] = useState<BibliotecaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [tagsInput, setTagsInput] = useState('');
  const [pages, setPages] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const pdfInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  function fetchItems() {
    fetch('/api/biblioteca')
      .then(res => res.json())
      .then(data => { setItems(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }

  function resetForm() {
    setTitle('');
    setAuthor('');
    setDescription('');
    setCategory('General');
    setTagsInput('');
    setPages('');
    setPdfFile(null);
    setCoverFile(null);
    setCoverPreview(null);
    if (pdfInputRef.current) pdfInputRef.current.value = '';
    if (coverInputRef.current) coverInputRef.current.value = '';
  }

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onload = () => setCoverPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();

    if (!pdfFile) {
      setMessage({ type: 'error', text: 'Selecciona un archivo PDF.' });
      return;
    }

    setUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('file', pdfFile);
    formData.append('title', title);
    formData.append('author', author);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('tags', tagsInput);
    formData.append('pages', pages);
    if (coverFile) {
      formData.append('cover', coverFile);
    }

    try {
      const res = await fetch('/api/biblioteca', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: `"${data.item.title}" subido correctamente.` });
        resetForm();
        setShowForm(false);
        fetchItems();
      } else {
        setMessage({ type: 'error', text: data.error || 'Error al subir.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Error de conexión.' });
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`¿Eliminar "${title}" de la biblioteca?`)) return;

    try {
      const res = await fetch('/api/biblioteca', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: `"${title}" eliminado.` });
        fetchItems();
      } else {
        setMessage({ type: 'error', text: 'Error al eliminar.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Error de conexión.' });
    }
  }

  return (
    <Layout>
      <div className="animate-fade-in-up max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link href="/admin" className="text-xs text-zinc-600 hover:text-zinc-400 transition">Admin</Link>
              <span className="text-zinc-700">/</span>
              <span className="text-xs text-zinc-400">Biblioteca</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Gestor de Biblioteca</h1>
            <div className="w-12 h-px bg-gradient-to-r from-amber-700/40 to-emerald-700/30 mt-2" />
          </div>
          <div className="flex gap-2">
            <Link href="/biblioteca" className="px-4 py-2 text-xs text-zinc-500 border border-zinc-800/50 rounded-xl hover:text-zinc-300 hover:border-zinc-700 transition">
              Ver biblioteca
            </Link>
            <button
              onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${showForm ? 'bg-zinc-800 text-zinc-400' : 'bg-emerald-600/90 text-white hover:bg-emerald-500'}`}
            >
              {showForm ? '✕ Cancelar' : '+ Subir PDF'}
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 px-4 py-3 rounded-xl text-sm ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-700/20' : 'bg-red-500/10 text-red-400 border border-red-700/20'}`}>
            {message.text}
          </div>
        )}

        {/* Upload Form */}
        {showForm && (
          <form onSubmit={handleUpload} className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6 mb-8 space-y-5">
            <h2 className="text-sm font-semibold text-zinc-300 mb-4">Nuevo documento</h2>

            {/* PDF upload */}
            <div>
              <label className="block text-xs text-zinc-500 mb-2">Archivo PDF *</label>
              <div
                onClick={() => pdfInputRef.current?.click()}
                className="border-2 border-dashed border-zinc-800/60 hover:border-emerald-700/30 rounded-xl p-8 text-center cursor-pointer transition group"
              >
                <input
                  ref={pdfInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={e => setPdfFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                {pdfFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <svg className="w-8 h-8 text-red-500/40" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
                    </svg>
                    <div className="text-left">
                      <p className="text-sm text-zinc-300">{pdfFile.name}</p>
                      <p className="text-xs text-zinc-600">{formatFileSize(pdfFile.size)}</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <svg className="w-10 h-10 mx-auto text-zinc-700 group-hover:text-emerald-700/50 transition mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-xs text-zinc-600">Haz clic o arrastra un archivo PDF aquí</p>
                    <p className="text-[10px] text-zinc-700 mt-1">Máximo 100MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Title & Author */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Título *</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Título del documento"
                  required
                  className="w-full px-3 py-2 bg-zinc-900/80 border border-zinc-800/50 rounded-lg text-sm text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-emerald-700/40 transition"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Autor</label>
                <input
                  type="text"
                  value={author}
                  onChange={e => setAuthor(e.target.value)}
                  placeholder="Nombre del autor"
                  className="w-full px-3 py-2 bg-zinc-900/80 border border-zinc-800/50 rounded-lg text-sm text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-emerald-700/40 transition"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Descripción</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Breve descripción del contenido..."
                rows={3}
                className="w-full px-3 py-2 bg-zinc-900/80 border border-zinc-800/50 rounded-lg text-sm text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-emerald-700/40 transition resize-none"
              />
            </div>

            {/* Category, Tags, Pages */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Categoría</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900/80 border border-zinc-800/50 rounded-lg text-sm text-zinc-400 focus:outline-none focus:border-emerald-700/40 transition appearance-none"
                >
                  {defaultCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Etiquetas</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={e => setTagsInput(e.target.value)}
                  placeholder="ej: marxismo, economía"
                  className="w-full px-3 py-2 bg-zinc-900/80 border border-zinc-800/50 rounded-lg text-sm text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-emerald-700/40 transition"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Páginas</label>
                <input
                  type="number"
                  value={pages}
                  onChange={e => setPages(e.target.value)}
                  placeholder="Opcional"
                  min="1"
                  className="w-full px-3 py-2 bg-zinc-900/80 border border-zinc-800/50 rounded-lg text-sm text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-emerald-700/40 transition"
                />
              </div>
            </div>

            {/* Cover image */}
            <div>
              <label className="block text-xs text-zinc-500 mb-2">Imagen de portada (opcional)</label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  className="px-4 py-2 text-xs border border-zinc-800/50 text-zinc-500 rounded-lg hover:border-zinc-700 hover:text-zinc-300 transition"
                >
                  Seleccionar imagen
                </button>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCoverChange}
                  className="hidden"
                />
                {coverPreview && (
                  <div className="relative w-16 h-20 rounded-lg overflow-hidden border border-zinc-800/50">
                    <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setCoverFile(null); setCoverPreview(null); }}
                      className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/80 text-white rounded-full text-[10px] flex items-center justify-center hover:bg-red-600 transition"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={uploading || !pdfFile}
                className="px-6 py-2.5 bg-emerald-600/90 text-white text-sm font-semibold rounded-xl hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  'Subir a la biblioteca'
                )}
              </button>
            </div>
          </form>
        )}

        {/* Items List */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-emerald-700/30 border-t-emerald-500 rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-zinc-600 text-sm">La biblioteca está vacía.</p>
            <button onClick={() => setShowForm(true)} className="mt-3 text-xs text-emerald-500 hover:text-emerald-400 transition">
              Sube tu primer documento →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-zinc-600 mb-4">{items.length} documento{items.length !== 1 ? 's' : ''} en la biblioteca</p>
            {items.map(item => (
              <div key={item.id} className="flex items-center gap-4 bg-zinc-900/40 border border-zinc-800/40 rounded-xl p-4 hover:border-zinc-700/50 transition group">
                {/* Icon/Cover */}
                <div className="w-12 h-16 shrink-0 rounded-lg overflow-hidden bg-zinc-900/80 border border-zinc-800/30">
                  {item.coverUrl ? (
                    <img src={item.coverUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-red-500/30" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-zinc-300 truncate">{item.title}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    {item.author && <span className="text-xs text-zinc-500">{item.author}</span>}
                    <span className="text-[10px] text-zinc-600 bg-zinc-800/50 px-1.5 py-0.5 rounded">{item.category}</span>
                    <span className="text-[10px] text-zinc-700">{formatFileSize(item.fileSize)}</span>
                    {item.pages && <span className="text-[10px] text-zinc-700">{item.pages} págs</span>}
                  </div>
                  <p className="text-[10px] text-zinc-700 mt-0.5">{formatDate(item.uploadedAt)}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 opacity-50 group-hover:opacity-100 transition">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 text-xs text-emerald-500 border border-emerald-700/20 rounded-lg hover:bg-emerald-500/10 transition"
                  >
                    Abrir
                  </a>
                  <a
                    href={item.url}
                    download
                    className="px-3 py-1.5 text-xs text-zinc-500 border border-zinc-800/50 rounded-lg hover:bg-zinc-800/50 transition"
                  >
                    Descargar
                  </a>
                  <button
                    onClick={() => handleDelete(item.id, item.title)}
                    className="px-3 py-1.5 text-xs text-red-500/60 border border-red-900/20 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
