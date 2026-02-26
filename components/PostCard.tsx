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

export default function PostCard({ post }: { post: Post }) {
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
