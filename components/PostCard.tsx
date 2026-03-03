import Link from 'next/link';
import { Post } from '../utils/posts';

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export default function PostCard({ post, variant = 'default' }: { post: Post; variant?: 'default' | 'hero' | 'compact' }) {
  if (variant === 'hero') {
    return (
      <Link href={`/p/${post.slug}`} className="group block">
        <div className="relative h-full rounded-2xl border border-amber-700/20 bg-gradient-to-br from-zinc-900/80 via-zinc-900/60 to-amber-950/10 overflow-hidden transition-all duration-300 hover:border-amber-600/30 hover:shadow-xl hover:shadow-amber-950/20 hover:-translate-y-0.5">
          {/* Cover - large */}
          {post.cover && (
            <div className="relative overflow-hidden aspect-[16/9]">
              <img
                src={post.cover}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
              {/* Overlay content on image */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest mb-2">
                  <span className="text-amber-400/80 font-bold">{post.category}</span>
                  <span className="text-amber-700/40">&bull;</span>
                  <span className="text-zinc-400">{formatDate(post.date)}</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-50 mb-2 group-hover:text-amber-200 transition-colors duration-200 leading-tight">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="text-sm leading-relaxed text-zinc-300/80 line-clamp-2 mb-3 max-w-xl">{post.excerpt}</p>
                )}
                {post.tags.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap">
                    {post.tags.map(tag => (
                      <span key={tag} className="text-[10px] text-amber-400/60 bg-amber-500/10 border border-amber-700/20 px-2 py-0.5 rounded-full">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Fallback if no cover */}
          {!post.cover && (
            <div className="p-6">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest mb-3">
                <span className="text-amber-400/80 font-bold">{post.category}</span>
                <span className="text-amber-700/40">&bull;</span>
                <span className="text-zinc-500">{formatDate(post.date)}</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100 mb-3 group-hover:text-amber-200 transition-colors duration-200 leading-tight">
                {post.title}
              </h3>
              {post.excerpt && (
                <p className="text-sm leading-relaxed text-zinc-400 line-clamp-3 mb-3">{post.excerpt}</p>
              )}
              {post.tags.length > 0 && (
                <div className="flex gap-1.5 flex-wrap">
                  {post.tags.map(tag => (
                    <span key={tag} className="text-[10px] text-amber-400/60 bg-amber-500/10 border border-amber-700/20 px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          )}
          {/* Featured badge */}
          <div className="absolute top-3 right-3 text-[9px] font-bold uppercase tracking-widest text-amber-400/90 bg-amber-500/15 backdrop-blur-sm border border-amber-600/20 px-2.5 py-1 rounded-full">
            ★ Destacado
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link href={`/p/${post.slug}`} className="group block">
        <div className="flex gap-3 p-3 rounded-xl border border-amber-800/15 bg-zinc-900/50 transition-all duration-300 hover:bg-zinc-900/80 hover:border-amber-700/25 hover:-translate-y-0.5">
          {post.cover && (
            <div className="relative overflow-hidden rounded-lg w-20 h-20 shrink-0">
              <img src={post.cover} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest text-zinc-600 mb-1">
              <span className="text-amber-500/60">{post.category}</span>
              <span className="text-amber-700/30">&bull;</span>
              <span>{formatDate(post.date)}</span>
            </div>
            <h3 className="text-sm font-semibold text-zinc-300 group-hover:text-amber-200/80 transition-colors duration-200 leading-snug line-clamp-2">
              {post.title}
            </h3>
          </div>
        </div>
      </Link>
    );
  }

  // Default variant (for Recientes)
  return (
    <Link href={`/p/${post.slug}`} className="group block">
      <div className="h-full p-5 rounded-2xl border border-zinc-800/60 bg-zinc-900/40 transition-all duration-300 hover:bg-zinc-900/80 hover:border-emerald-800/25 hover:shadow-lg hover:shadow-emerald-950/10 hover:-translate-y-0.5">
        {/* Cover */}
        {post.cover && (
          <div className="relative overflow-hidden rounded-xl mb-4 aspect-[16/10]">
            <img
              src={post.cover}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        )}

        {/* Meta */}
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-600 mb-2">
          <span className="text-emerald-600/50">{post.category}</span>
          <span className="text-amber-700/30">&bull;</span>
          <span>{formatDate(post.date)}</span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold tracking-tight text-zinc-200 mb-2 group-hover:text-amber-200/80 transition-colors duration-200 leading-snug">
          {post.title}
        </h3>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-sm leading-relaxed text-zinc-500 line-clamp-2 mb-3">{post.excerpt}</p>
        )}

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex gap-1.5 flex-wrap mt-auto pt-2">
            {post.tags.map(tag => (
              <span key={tag} className="text-[10px] text-emerald-600/50 bg-emerald-500/5 border border-emerald-900/15 px-2 py-0.5 rounded-full">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
