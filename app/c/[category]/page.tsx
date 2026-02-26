import Layout from '../../../components/Layout';
import { getAllPosts } from '../../../utils/posts';
import PostCard from '../../../components/PostCard';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Mapa de slugs a nombres de display para las categorías
const categoryDisplayNames: Record<string, string> = {
  'ciencia': 'Ciencia',
  'ingenieria': 'Ingeniería',
  'politica-nacional': 'Política Nacional',
  'geopolitica': 'Geopolítica',
  'musica': 'Música',
  'futbol': 'Fútbol',
  'arte': 'Arte',
  'cine': 'Cine',
  'cultura-pop': 'Cultura Pop',
  'tecnologia': 'Tecnología',
  'general': 'General',
  'analisis': 'Análisis',
  'opinion': 'Opinión',
};

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const posts = getAllPosts();
  
  // Comparar normalizando: slugify de la categoría del post vs el slug de la URL
  const filtered = posts.filter(post => slugify(post.category) === slugify(category));
  const displayName = categoryDisplayNames[category] || decodeURIComponent(category);

  return (
    <Layout>
      <div className="animate-fade-in-up">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight mb-3">{displayName}</h1>
          <div className="w-12 h-px bg-gradient-to-r from-emerald-700/40 to-amber-700/40" />
          <p className="text-sm text-zinc-500 mt-3">{filtered.length} publicaciones</p>
        </div>
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-zinc-500 mb-4">No hay posts en esta categoría todavía.</p>
            <a href="/" className="text-sm text-emerald-500/70 hover:text-emerald-400 transition">&larr; Volver al inicio</a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map(post => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
