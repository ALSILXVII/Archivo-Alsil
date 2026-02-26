'use client';

import { useState, useEffect, useCallback } from 'react';

type Comment = {
  id: string;
  author: string;
  content: string;
  date: string;
  parentId: string | null;
};

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'hace un momento';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `hace ${days}d`;
  const months = Math.floor(days / 30);
  if (months < 12) return `hace ${months} mes${months > 1 ? 'es' : ''}`;
  return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
}

function CommentForm({
  slug,
  parentId,
  onSubmitted,
  onCancel,
  placeholder,
}: {
  slug: string;
  parentId?: string | null;
  onSubmitted: () => void;
  onCancel?: () => void;
  placeholder?: string;
}) {
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !content.trim()) return;

    setSending(true);
    setError('');

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, author: author.trim(), content: content.trim(), parentId: parentId || null }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Error al enviar');
        return;
      }

      setContent('');
      onSubmitted();
    } catch {
      setError('Error de red');
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {!parentId && (
        <input
          type="text"
          placeholder="Tu nombre"
          value={author}
          onChange={e => setAuthor(e.target.value)}
          maxLength={50}
          className="w-full bg-zinc-900/60 border border-zinc-800/60 rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-700/40 focus:ring-1 focus:ring-emerald-700/20 transition"
        />
      )}
      {parentId && !author && (
        <input
          type="text"
          placeholder="Tu nombre"
          value={author}
          onChange={e => setAuthor(e.target.value)}
          maxLength={50}
          className="w-full bg-zinc-900/60 border border-zinc-800/60 rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-700/40 focus:ring-1 focus:ring-emerald-700/20 transition"
        />
      )}
      <textarea
        placeholder={placeholder || 'Escribe un comentario...'}
        value={content}
        onChange={e => setContent(e.target.value)}
        maxLength={2000}
        rows={parentId ? 2 : 3}
        className="w-full bg-zinc-900/60 border border-zinc-800/60 rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-700/40 focus:ring-1 focus:ring-emerald-700/20 transition resize-none"
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={sending || !author.trim() || !content.trim()}
          className="px-4 py-2 bg-emerald-600/20 text-emerald-400 text-xs font-semibold rounded-lg border border-emerald-700/30 hover:bg-emerald-600/30 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {sending ? 'Enviando...' : parentId ? 'Responder' : 'Comentar'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="px-3 py-2 text-xs text-zinc-500 hover:text-zinc-300 transition">
            Cancelar
          </button>
        )}
        <span className="ml-auto text-[10px] text-zinc-600">{content.length}/2000</span>
      </div>
    </form>
  );
}

function CommentItem({
  comment,
  replies,
  slug,
  onRefresh,
}: {
  comment: Comment;
  replies: Comment[];
  slug: string;
  onRefresh: () => void;
}) {
  const [showReply, setShowReply] = useState(false);

  // Generate a consistent color from author name
  const hue = comment.author.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;

  return (
    <div className="group">
      <div className="flex gap-3">
        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
          style={{ backgroundColor: `hsl(${hue}, 30%, 15%)`, color: `hsl(${hue}, 50%, 60%)` }}
        >
          {comment.author.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-zinc-300">{comment.author}</span>
            <span className="text-[10px] text-zinc-600">{timeAgo(comment.date)}</span>
          </div>
          <p className="text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap break-words">{comment.content}</p>
          <button
            onClick={() => setShowReply(!showReply)}
            className="mt-1.5 text-[11px] text-zinc-600 hover:text-emerald-500 transition"
          >
            {showReply ? 'Cancelar' : 'Responder'}
          </button>

          {showReply && (
            <div className="mt-3">
              <CommentForm
                slug={slug}
                parentId={comment.id}
                onSubmitted={() => { setShowReply(false); onRefresh(); }}
                onCancel={() => setShowReply(false)}
                placeholder={`Responder a ${comment.author}...`}
              />
            </div>
          )}

          {/* Replies */}
          {replies.length > 0 && (
            <div className="mt-4 space-y-4 pl-4 border-l border-zinc-800/40">
              {replies.map(reply => (
                <CommentItem key={reply.id} comment={reply} replies={[]} slug={slug} onRefresh={onRefresh} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CommentsSection({ slug }: { slug: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/comments?slug=${slug}`);
      if (res.ok) {
        setComments(await res.json());
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const topLevel = comments.filter(c => !c.parentId);
  const getReplies = (id: string) => comments.filter(c => c.parentId === id);

  return (
    <section className="mt-16 pt-8 border-t border-zinc-800/40">
      <div className="flex items-center gap-3 mb-8">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-emerald-600/50">
          Comentarios
        </h2>
        {comments.length > 0 && (
          <span className="text-[10px] text-zinc-600 bg-zinc-800/40 px-2 py-0.5 rounded-full">
            {comments.length}
          </span>
        )}
        <div className="flex-1 h-px bg-gradient-to-r from-emerald-900/20 to-transparent" />
      </div>

      {/* Comment form */}
      <div className="mb-8">
        <CommentForm slug={slug} onSubmitted={fetchComments} />
      </div>

      {/* Comments list */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block w-5 h-5 border-2 border-zinc-700 border-t-emerald-600/50 rounded-full animate-spin" />
        </div>
      ) : topLevel.length === 0 ? (
        <p className="text-center text-zinc-600 text-sm py-8">Sé el primero en comentar.</p>
      ) : (
        <div className="space-y-6">
          {topLevel.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              replies={getReplies(comment.id)}
              slug={slug}
              onRefresh={fetchComments}
            />
          ))}
        </div>
      )}
    </section>
  );
}
