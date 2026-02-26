'use client';

import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
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
}

const categoryColors: Record<string, string> = {
  'Ciencia': 'text-emerald-400 border-emerald-700/30 bg-emerald-500/5',
  'Ingeniería': 'text-blue-400 border-blue-700/30 bg-blue-500/5',
  'Política': 'text-red-400 border-red-700/30 bg-red-500/5',
  'Filosofía': 'text-purple-400 border-purple-700/30 bg-purple-500/5',
  'Historia': 'text-amber-400 border-amber-700/30 bg-amber-500/5',
  'Literatura': 'text-pink-400 border-pink-700/30 bg-pink-500/5',
  'Arte': 'text-violet-400 border-violet-700/30 bg-violet-500/5',
  'Economía': 'text-teal-400 border-teal-700/30 bg-teal-500/5',
  'General': 'text-zinc-400 border-zinc-700/30 bg-zinc-500/5',
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function BibliotecaPage() {
  const [items, setItems] = useState<BibliotecaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetch('/api/biblioteca')
      .then(res => res.json())
      .then(data => { setItems(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const categories = [...new Set(items.map(i => i.category))].sort();

  const filtered = items.filter(item => {
    const matchSearch = search === '' ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.author.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchCategory = filterCategory === '' || item.category === filterCategory;
    return matchSearch && matchCategory;
  });

  return (
    <Layout>
      <div className="animate-fade-in-up">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <svg className="w-6 h-6 text-amber-500/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h1 className="text-3xl font-bold tracking-tight">Biblioteca Personal</h1>
          </div>
          <div className="w-16 h-px bg-gradient-to-r from-amber-700/40 via-emerald-700/30 to-transparent mt-3" />
          <p className="text-sm text-zinc-500 mt-3 max-w-xl font-editorial">
            Colección curada de documentos, ensayos, artículos e investigaciones en formato PDF.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por título, autor o etiqueta..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/50 border border-zinc-800/50 rounded-xl text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-700/40 focus:ring-1 focus:ring-emerald-700/20 transition"
            />
          </div>

          {/* Category filter */}
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="px-4 py-2.5 bg-zinc-900/50 border border-zinc-800/50 rounded-xl text-sm text-zinc-400 focus:outline-none focus:border-emerald-700/40 transition appearance-none cursor-pointer"
          >
            <option value="">Todas las categorías</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* View toggle */}
          <div className="flex border border-zinc-800/50 rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2.5 transition ${viewMode === 'grid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-900/50 text-zinc-600 hover:text-zinc-400'}`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" /></svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2.5 transition ${viewMode === 'list' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-900/50 text-zinc-600 hover:text-zinc-400'}`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z" /></svg>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-6 text-xs text-zinc-600">
          <span>{filtered.length} documento{filtered.length !== 1 ? 's' : ''}</span>
          {filterCategory && (
            <button onClick={() => setFilterCategory('')} className="text-emerald-600 hover:text-emerald-400 transition">
              ✕ Limpiar filtro
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-emerald-700/30 border-t-emerald-500 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-16 h-16 mx-auto text-zinc-800 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className="text-zinc-600 text-sm">
              {search || filterCategory ? 'No se encontraron documentos con esos criterios.' : 'La biblioteca está vacía. Sube tu primer PDF desde el panel de administración.'}
            </p>
            {!search && !filterCategory && (
              <Link href="/admin/biblioteca" className="inline-block mt-4 text-xs text-emerald-500 hover:text-emerald-400 transition">
                Ir al gestor de biblioteca →
              </Link>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((item, i) => (
              <div
                key={item.id}
                className="group bg-zinc-900/40 border border-zinc-800/40 rounded-2xl overflow-hidden hover:border-emerald-800/30 hover:shadow-lg hover:shadow-emerald-900/5 transition-all duration-300"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {/* Cover / PDF icon */}
                <div className="relative aspect-[3/4] bg-zinc-900/80 overflow-hidden">
                  {item.coverUrl ? (
                    <img
                      src={item.coverUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-900/95 to-emerald-950/20">
                      <svg className="w-16 h-16 text-red-500/20 mb-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
                      </svg>
                      <span className="text-[10px] font-mono text-red-500/30 uppercase tracking-widest">PDF</span>
                    </div>
                  )}
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <div className="flex gap-2 w-full">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-center text-xs font-semibold py-2 rounded-lg bg-emerald-600/90 text-white hover:bg-emerald-500 transition"
                      >
                        Abrir PDF
                      </a>
                      <a
                        href={item.url}
                        download
                        className="px-3 py-2 rounded-lg bg-zinc-700/80 text-zinc-300 hover:bg-zinc-600 transition"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </a>
                    </div>
                  </div>
                  {/* File size badge */}
                  <div className="absolute top-2 right-2 text-[10px] font-mono text-zinc-500 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-md">
                    {formatFileSize(item.fileSize)}
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 space-y-2">
                  <div className={`inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${categoryColors[item.category] || categoryColors['General']}`}>
                    {item.category}
                  </div>
                  <h3 className="text-sm font-semibold text-zinc-200 leading-snug line-clamp-2 group-hover:text-amber-200/90 transition">
                    {item.title}
                  </h3>
                  {item.author && (
                    <p className="text-xs text-zinc-500">{item.author}</p>
                  )}
                  {item.description && (
                    <p className="text-xs text-zinc-600 line-clamp-2 font-editorial leading-relaxed">{item.description}</p>
                  )}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-zinc-600">{formatDate(item.uploadedAt)}</span>
                    {item.pages && (
                      <span className="text-[10px] text-zinc-600">{item.pages} págs</span>
                    )}
                  </div>
                  {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {item.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[10px] text-zinc-600 bg-zinc-800/50 px-1.5 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                      {item.tags.length > 3 && (
                        <span className="text-[10px] text-zinc-700">+{item.tags.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="space-y-3">
            {filtered.map((item, i) => (
              <div
                key={item.id}
                className="group flex gap-4 bg-zinc-900/40 border border-zinc-800/40 rounded-xl p-4 hover:border-emerald-800/30 transition-all duration-300"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                {/* Thumbnail */}
                <div className="w-14 h-18 shrink-0 rounded-lg overflow-hidden bg-zinc-900/80">
                  {item.coverUrl ? (
                    <img src={item.coverUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-red-500/20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-200 group-hover:text-amber-200/90 transition truncate">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        {item.author && <span className="text-xs text-zinc-500">{item.author}</span>}
                        <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${categoryColors[item.category] || categoryColors['General']}`}>
                          {item.category}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-emerald-500 hover:text-emerald-400 transition font-medium"
                      >
                        Abrir
                      </a>
                      <a
                        href={item.url}
                        download
                        className="text-xs text-zinc-500 hover:text-zinc-300 transition"
                      >
                        Descargar
                      </a>
                    </div>
                  </div>
                  {item.description && (
                    <p className="text-xs text-zinc-600 mt-1 line-clamp-1">{item.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-zinc-600">
                    <span>{formatDate(item.uploadedAt)}</span>
                    <span>{formatFileSize(item.fileSize)}</span>
                    {item.pages && <span>{item.pages} págs</span>}
                    {item.tags.length > 0 && (
                      <span className="text-zinc-700">{item.tags.join(', ')}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
