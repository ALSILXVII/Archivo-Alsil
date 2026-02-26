'use client';

import { useState, useEffect } from 'react';

type AuthorData = {
  name: string;
  role: string;
  bio: string;
  photo: string;
  email: string;
  twitter: string;
};

export default function AuthorByline() {
  const [author, setAuthor] = useState<AuthorData | null>(null);

  useEffect(() => {
    fetch('/api/author')
      .then(r => r.json())
      .then((data: AuthorData) => setAuthor(data))
      .catch(() => {});
  }, []);

  if (!author) return null;

  const initials = author.name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();

  return (
    <div className="mt-14 mb-2 pt-8 border-t border-zinc-800/50">
      <div className="flex items-start gap-4">
        {/* Photo or initials */}
        {author.photo ? (
          <img
            src={author.photo}
            alt={author.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-emerald-700/30 shadow-lg shadow-black/20 flex-shrink-0"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-800/40 to-amber-800/30 border-2 border-emerald-700/30 flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-bold text-emerald-400/80">{initials}</span>
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-widest text-amber-500/50 font-semibold mb-1">Escrito por</div>
          <h3 className="text-base font-semibold text-zinc-100 leading-tight">{author.name}</h3>
          <p className="text-xs text-emerald-600/70 mt-0.5">{author.role}</p>
          {author.bio && (
            <p className="text-sm text-zinc-400 mt-2 leading-relaxed">{author.bio}</p>
          )}
          {(author.email || author.twitter) && (
            <div className="flex gap-3 mt-2">
              {author.email && (
                <a href={`mailto:${author.email}`} className="text-xs text-zinc-500 hover:text-emerald-400 transition">
                  ✉ {author.email}
                </a>
              )}
              {author.twitter && (
                <a href={`https://x.com/${author.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-xs text-zinc-500 hover:text-emerald-400 transition">
                  𝕏 {author.twitter}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
