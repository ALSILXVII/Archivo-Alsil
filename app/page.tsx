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
            <div className="w-full h-[300px] md:w-[280px] lg:w-[320px] md:h-auto shrink-0">
              <ProfileBanner />
            </div>
          </div>

          {/* Categorías */}
          <nav className="flex gap-2.5 overflow-x-auto pb-3 scrollbar-thin">
            {categories.map((cat, i) => {
              const icons: Record<string, string> = {
                'Ciencia': '🔬',
                'Ingeniería': '⚙️',
                'Política Nacional': '🏛️',
                'Geopolítica': '🌍',
                'Música': '🎵',
                'Fútbol': '⚽',
                'Arte': '🎨',
                'Cine': '🎬',
                'Cultura Pop': '💫',
              };
              const colors = [
                'from-emerald-600/20 to-emerald-800/5 border-emerald-700/25 hover:border-emerald-500/40 hover:from-emerald-600/30 text-emerald-400/80 hover:text-emerald-300',
                'from-blue-600/20 to-blue-800/5 border-blue-700/25 hover:border-blue-500/40 hover:from-blue-600/30 text-blue-400/80 hover:text-blue-300',
                'from-red-600/20 to-red-800/5 border-red-700/25 hover:border-red-500/40 hover:from-red-600/30 text-red-400/80 hover:text-red-300',
                'from-amber-600/20 to-amber-800/5 border-amber-700/25 hover:border-amber-500/40 hover:from-amber-600/30 text-amber-400/80 hover:text-amber-300',
                'from-purple-600/20 to-purple-800/5 border-purple-700/25 hover:border-purple-500/40 hover:from-purple-600/30 text-purple-400/80 hover:text-purple-300',
                'from-green-600/20 to-green-800/5 border-green-700/25 hover:border-green-500/40 hover:from-green-600/30 text-green-400/80 hover:text-green-300',
                'from-pink-600/20 to-pink-800/5 border-pink-700/25 hover:border-pink-500/40 hover:from-pink-600/30 text-pink-400/80 hover:text-pink-300',
                'from-orange-600/20 to-orange-800/5 border-orange-700/25 hover:border-orange-500/40 hover:from-orange-600/30 text-orange-400/80 hover:text-orange-300',
                'from-cyan-600/20 to-cyan-800/5 border-cyan-700/25 hover:border-cyan-500/40 hover:from-cyan-600/30 text-cyan-400/80 hover:text-cyan-300',
              ];
              return (
                <a
                  key={cat}
                  href={"/c/" + slugify(cat)}
                  className={`whitespace-nowrap text-xs font-medium px-3.5 py-2 rounded-xl border bg-gradient-to-br transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg flex items-center gap-1.5 ${colors[i % colors.length]}`}
                >
                  <span className="text-sm">{icons[cat] || '📌'}</span>
                  {cat}
                </a>
              );
            })}
          </nav>

          {/* Destacados */}
          {featured.length > 0 && (
            <section className="relative">
              {/* Section header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex items-center gap-2">
                  <span className="text-amber-500/70 text-sm">★</span>
                  <h2 className="text-[11px] font-bold uppercase tracking-widest text-amber-500/60">Destacados</h2>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-amber-700/25 via-amber-900/15 to-transparent" />
              </div>

              {/* Magazine layout: first post hero, rest compact on the side */}
              {featured.length === 1 ? (
                <PostCard post={featured[0]} variant="hero" />
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                  {/* Hero card - takes 3 columns */}
                  <div className="lg:col-span-3">
                    <PostCard post={featured[0]} variant="hero" />
                  </div>
                  {/* Compact cards stacked - takes 2 columns */}
                  <div className="lg:col-span-2 flex flex-col gap-3">
                    {featured.slice(1).map(post => (
                      <PostCard key={post.slug} post={post} variant="compact" />
                    ))}
                  </div>
                </div>
              )}
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
