import Layout from '../../../components/Layout';
import Link from 'next/link';
import { getPostBySlug, getAllPosts } from '../../../utils/posts';
import CommentsSection from '../../../components/CommentsSection';
import AuthorByline from '../../../components/AuthorByline';

function slugify(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function renderMarkdown(md: string): string {
  let html = md
    .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-8 mb-3 text-zinc-200">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-10 mb-4 text-zinc-100">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-12 mb-5 text-zinc-100">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-zinc-200">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="rounded-xl my-6 max-w-full border border-zinc-800/50" />')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition">$1</a>')
    .replace(/^> (.*$)/gm, '<blockquote class="border-l-2 border-emerald-700/40 pl-5 italic text-zinc-400 my-6">$1</blockquote>')
    .replace(/^- (.*$)/gm, '<li class="ml-5 list-disc text-zinc-300 mb-1">$1</li>')
    .replace(/(<video[\s\S]*?<\/video>)/g, '$1')
    .replace(/\n\n/g, '</p><p class="mb-5 leading-[1.8] text-zinc-300">')
    .replace(/\n/g, '<br/>');
  html = `<p class="mb-5 leading-[1.8] text-zinc-300">${html}</p>`;
  return html;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
}

function readingTime(content: string): string {
  const words = content.split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.ceil(words / 200));
  return `${mins} min de lectura`;
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return <Layout><p className="text-center text-zinc-500 py-20">Post no encontrado.</p></Layout>;

  return (
    <Layout>
      <article className="max-w-3xl mx-auto animate-fade-in-up">
        {/* Cover */}
        {post.cover && (
          <div className="relative mb-10 -mx-4 sm:mx-0">
            <img src={post.cover} alt={post.title} className="w-full rounded-2xl border border-zinc-800/50 shadow-2xl shadow-black/30" />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-zinc-950/60 to-transparent" />
          </div>
        )}

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-zinc-500 mb-4">
          <Link href={`/c/${slugify(post.category)}`} className="uppercase tracking-widest text-emerald-600/60 hover:text-emerald-400 transition">
            {post.category}
          </Link>
          <span className="text-amber-700/40">&bull;</span>
          <time>{formatDate(post.date)}</time>
          <span className="text-amber-700/40">&bull;</span>
          <span>{readingTime(post.content)}</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-zinc-50 leading-tight tracking-tight">{post.title}</h1>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex gap-2 mb-10">
            {post.tags.map(tag => (
              <span key={tag} className="text-xs text-emerald-600/60 bg-emerald-500/5 border border-emerald-800/20 px-2.5 py-0.5 rounded-full">{tag}</span>
            ))}
          </div>
        )}

        {/* Divider */}
        <div className="w-12 h-px bg-gradient-to-r from-emerald-700/40 to-amber-700/40 mb-10" />

        {/* Content */}
        <div
          className="font-editorial max-w-none text-[15px]"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
        />

        {/* Author Byline */}
        <AuthorByline />

        {/* Comments */}
        <CommentsSection slug={slug} />

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-zinc-800/40 flex items-center justify-between">
          <Link href="/" className="text-sm text-zinc-500 hover:text-emerald-400 transition">
            &larr; Volver al inicio
          </Link>
          <div className="text-xs text-zinc-600">
            {formatDate(post.date)}
          </div>
        </div>
      </article>
    </Layout>
  );
}
