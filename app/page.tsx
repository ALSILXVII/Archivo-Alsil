import Layout from '../components/Layout';
import PostCard from '../components/PostCard';
import HeroCarousel from '../components/HeroCarousel';
import ProfileBanner from '../components/ProfileBanner';
import { getAllPosts, getFeaturedPosts, getRecentPosts } from '../utils/posts';

export const dynamic = 'force-dynamic';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const categories = [
  'Ciencia',
  'Ingeniería',
  'Política Nacional',
  'Geopolítica',
  'Música',
  'Fútbol',
  'Arte',
  'Cine',
  'Cultura Pop',
];

export default function Home() {
  const featured = getFeaturedPosts();
  const recent = getRecentPosts();
  return (
    <Layout>
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 animate-fade-in-up">
        {/* Sidebar / Author block - appears after content on mobile */}
        <aside className="order-2 lg:order-1 lg:w-[260px] w-full shrink-0 lg:sticky lg:top-20 lg:self-start space-y-5">
          <div className="bg-zinc-900/40 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800/40 flex flex-col items-center space-y-4">
            <img src="/uploads/logo.png" alt="Archivo ALSIL" className="w-20 h-20 rounded-full border-2 border-amber-600/25 ring-1 ring-emerald-700/15 transition-all duration-300 hover:shadow-[0_0_20px_4px_rgba(16,185,129,0.1)] hover:scale-105" />
            <div className="text-amber-200/80 font-semibold text-center text-sm">Archivo ALSIL</div>
            <p className="text-zinc-500 text-xs font-editorial text-center leading-relaxed">
              Análisis, opinión y divulgación sobre ciencia, ingeniería, política, arte y cultura.
            </p>
          </div>

          <div className="bg-zinc-900/40 backdrop-blur-sm rounded-2xl p-5 border border-zinc-800/40">
            <div className="text-emerald-500/60 text-[10px] font-semibold uppercase tracking-widest mb-3">Lema</div>
            <p className="text-zinc-400 text-sm font-editorial italic text-center leading-relaxed">
              «Pienso, luego existo»
            </p>
            <p className="text-zinc-600 text-[11px] text-center mt-2">— René Descartes</p>
          </div>
        </aside>

        {/* Main content - appears first on mobile */}
        <div className="order-1 lg:order-2 flex-1 min-w-0 space-y-8 sm:space-y-10">
          {/* Hero + Profile Banners */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 min-w-0">
              <HeroCarousel />
            </div>
            <div className="md:w-[280px] lg:w-[320px] shrink-0 min-h-[280px] md:min-h-0">
              <ProfileBanner />
            </div>
          </div>

          {/* Categorías */}
          <nav className="flex gap-2 overflow-x-auto pb-3 border-b border-zinc-800/30 scrollbar-thin">
            {categories.map(cat => (
              <a
                key={cat}
                href={"/c/" + slugify(cat)}
                className="whitespace-nowrap text-xs text-zinc-500 hover:text-emerald-400 px-3 py-1.5 rounded-full border border-zinc-800/50 hover:border-emerald-600/25 hover:bg-emerald-500/5 transition-all duration-200"
              >
                {cat}
              </a>
            ))}
          </nav>

          {/* Destacados */}
          {featured.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-5">
                <h2 className="text-[11px] font-semibold uppercase tracking-widest text-emerald-600/50">Destacados</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-emerald-900/20 to-transparent" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {featured.map(post => (
                  <PostCard key={post.slug} post={post} />
                ))}
              </div>
            </section>
          )}

          {/* Recientes */}
          <section>
            <div className="flex items-center gap-3 mb-5">
              <h2 className="text-[11px] font-semibold uppercase tracking-widest text-amber-600/40">Recientes</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-amber-900/15 to-transparent" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {recent.map(post => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}
