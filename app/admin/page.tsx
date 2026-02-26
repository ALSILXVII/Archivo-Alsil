'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type PostItem = {
  title: string;
  slug: string;
  date: string;
  category: string;
  tags: string[];
  featured: boolean;
  excerpt: string;
};

export default function AdminPage() {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/login');
  };

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts');
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch {
      setMessage({ text: 'Error al cargar posts', type: 'error' });
    }
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleDelete = async (slug: string) => {
    if (!confirm(`¿Estás seguro de eliminar "${slug}"?`)) return;
    setDeleting(slug);
    try {
      const res = await fetch(`/api/posts?slug=${slug}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setMessage({ text: 'Post eliminado', type: 'success' });
        fetchPosts();
      } else {
        setMessage({ text: data.error || 'Error al eliminar', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Error de red', type: 'error' });
    }
    setDeleting(null);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 py-4 px-6">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-semibold tracking-widest font-serif text-zinc-100">
            Archivo ALSIL
          </Link>
          <div className="flex gap-4 items-center">
            <Link href="/" className="text-zinc-400 hover:text-amber-400 text-sm transition">
              ← Volver al sitio
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg bg-red-600/80 text-white font-semibold hover:bg-red-500 transition text-sm"
            >
              Cerrar sesión
            </button>
            <Link
              href="/admin/hero"
              className="px-5 py-2 rounded-lg bg-purple-600/90 text-white font-semibold hover:bg-purple-500 transition text-sm"
            >
              🖼️ Banner
            </Link>
            <Link
              href="/admin/profile"
              className="px-5 py-2 rounded-lg bg-cyan-600/90 text-white font-semibold hover:bg-cyan-500 transition text-sm"
            >
              👤 Mi Perfil
            </Link>
            <Link
              href="/admin/autor"
              className="px-5 py-2 rounded-lg bg-orange-600/90 text-white font-semibold hover:bg-orange-500 transition text-sm"
            >
              ✍️ Autor
            </Link>
            <Link
              href="/admin/redes"
              className="px-5 py-2 rounded-lg bg-blue-600/90 text-white font-semibold hover:bg-blue-500 transition text-sm"
            >
              🌐 Redes
            </Link>
            <Link
              href="/admin/biblioteca"
              className="px-5 py-2 rounded-lg bg-emerald-600/90 text-white font-semibold hover:bg-emerald-500 transition text-sm"
            >
              📚 Biblioteca
            </Link>
            <Link
              href="/admin/crear"
              className="px-5 py-2 rounded-lg bg-amber-500 text-zinc-950 font-semibold hover:bg-amber-400 transition text-sm"
            >
              + Nuevo Post
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
        <h1 className="text-2xl font-bold mb-8">Panel de Administración</h1>

        {loading ? (
          <div className="text-zinc-500 text-center py-12">Cargando posts...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <div className="text-zinc-500 text-lg">No hay posts todavía</div>
            <Link
              href="/admin/crear"
              className="inline-block px-6 py-3 rounded-lg bg-amber-500 text-zinc-950 font-semibold hover:bg-amber-400 transition"
            >
              Crear tu primer post
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {posts
              .sort((a, b) => b.date.localeCompare(a.date))
              .map(post => (
                <div
                  key={post.slug}
                  className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 transition"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <Link href={`/p/${post.slug}`} className="text-lg font-semibold text-zinc-200 hover:text-amber-400 transition">
                        {post.title}
                      </Link>
                      {post.featured && (
                        <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">Destacado</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-500">
                      <span>{post.date}</span>
                      <span>·</span>
                      <span>{post.category}</span>
                      {post.tags.length > 0 && (
                        <>
                          <span>·</span>
                          <span>{post.tags.join(', ')}</span>
                        </>
                      )}
                    </div>
                    {post.excerpt && (
                      <p className="text-sm text-zinc-500 mt-1 line-clamp-1">{post.excerpt}</p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Link
                      href={`/p/${post.slug}`}
                      className="px-3 py-1.5 rounded border border-zinc-700 text-zinc-400 hover:bg-zinc-800 text-xs transition"
                    >
                      Ver
                    </Link>
                    <button
                      onClick={() => handleDelete(post.slug)}
                      disabled={deleting === post.slug}
                      className="px-3 py-1.5 rounded border border-red-900 text-red-400 hover:bg-red-900/30 text-xs transition disabled:opacity-50"
                    >
                      {deleting === post.slug ? '...' : 'Eliminar'}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
