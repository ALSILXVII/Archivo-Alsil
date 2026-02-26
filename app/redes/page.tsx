'use client';

import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import React from 'react';

type SocialLink = {
  id: string;
  name: string;
  url: string;
  description: string;
  enabled: boolean;
  order: number;
};

const iconMap: Record<string, React.ReactNode> = {
  twitter: (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  instagram: (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  ),
  youtube: (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),
  tiktok: (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  ),
  spotify: (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  ),
  threads: (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.59 12c.025 3.086.718 5.496 2.057 7.164 1.432 1.781 3.632 2.695 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.187.408-2.26 1.33-3.017.838-.69 1.998-1.09 3.453-1.19 1.076-.073 2.074.01 2.983.243-.096-.543-.282-1.003-.558-1.38-.49-.668-1.27-1.013-2.318-1.028h-.04c-.788.006-1.46.197-1.997.57l-1.1-1.672c.859-.594 1.935-.908 3.114-.921h.057c1.637.021 2.882.579 3.7 1.658.72.95 1.12 2.208 1.193 3.74l.019.397c.895.378 1.65.906 2.249 1.582 1.065 1.202 1.563 2.762 1.436 4.51-.174 2.37-1.133 4.263-2.85 5.623C17.913 23.145 15.4 23.974 12.186 24zm1.393-8.586c-.052 0-.104 0-.157.002-1.558.106-2.328.758-2.293 1.386.02.353.222.685.573.94.459.332 1.095.504 1.793.465 1.045-.057 1.83-.455 2.332-1.183.333-.483.538-1.1.625-1.846-.89-.237-1.85-.358-2.822-.358l-.051-.006z" />
    </svg>
  ),
};

const colorMap: Record<string, { border: string; text: string }> = {
  twitter: { border: 'hover:border-zinc-400/40 hover:bg-zinc-400/5', text: 'group-hover:text-zinc-300' },
  instagram: { border: 'hover:border-pink-500/30 hover:bg-pink-500/5', text: 'group-hover:text-pink-400' },
  youtube: { border: 'hover:border-red-500/30 hover:bg-red-500/5', text: 'group-hover:text-red-400' },
  tiktok: { border: 'hover:border-cyan-400/30 hover:bg-cyan-400/5', text: 'group-hover:text-cyan-400' },
  spotify: { border: 'hover:border-green-500/30 hover:bg-green-500/5', text: 'group-hover:text-green-400' },
  threads: { border: 'hover:border-purple-400/30 hover:bg-purple-400/5', text: 'group-hover:text-purple-400' },
};

const defaultColor = { border: 'hover:border-emerald-500/30 hover:bg-emerald-500/5', text: 'group-hover:text-emerald-400' };

export default function RedesSocialesPage() {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/redes')
      .then(r => r.json())
      .then((data: SocialLink[]) => {
        setLinks(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const enabledLinks = links.filter(l => l.enabled).sort((a, b) => a.order - b.order);

  return (
    <Layout>
      <div className="max-w-3xl mx-auto animate-fade-in-up">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 text-zinc-50">Redes Sociales</h1>
          <div className="w-16 h-px bg-gradient-to-r from-emerald-700/40 via-amber-700/40 to-emerald-700/40 mx-auto mb-4" />
          <p className="text-zinc-500 text-sm max-w-md mx-auto leading-relaxed">
            Estas son mis redes sociales por si gustas seguirme.
          </p>
        </div>

        {loading ? (
          <div className="text-zinc-500 text-center py-12">Cargando...</div>
        ) : enabledLinks.length === 0 ? (
          <div className="text-zinc-600 text-center py-12">No hay redes configuradas aún.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {enabledLinks.map((social) => {
              const colors = colorMap[social.id] || defaultColor;
              const icon = iconMap[social.id];
              return (
                <a
                  key={social.id}
                  href={social.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group flex items-center gap-4 p-5 rounded-2xl border border-zinc-800/60 bg-zinc-900/40 transition-all duration-300 ${colors.border} hover:-translate-y-0.5 hover:shadow-lg`}
                >
                  {icon && (
                    <div className={`text-zinc-500 transition-colors duration-300 ${colors.text}`}>
                      {icon}
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-semibold text-zinc-200 mb-0.5">{social.name}</div>
                    <div className="text-xs text-zinc-500">{social.description}</div>
                  </div>
                  <svg className="w-4 h-4 text-zinc-700 ml-auto group-hover:text-zinc-500 transition group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              );
            })}
          </div>
        )}

        {/* Email */}
        <div className="mt-12 p-6 rounded-2xl border border-amber-800/20 bg-amber-500/5 text-center">
          <div className="text-amber-400/70 text-xs font-semibold uppercase tracking-widest mb-2">Correo electrónico</div>
          <a href="mailto:miguelitoalsil@gmail.com" className="text-zinc-300 text-sm hover:text-emerald-400 transition">
            miguelitoalsil@gmail.com
          </a>
        </div>
      </div>
    </Layout>
  );
}
