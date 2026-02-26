'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

type ProfileSlide = {
  id: string;
  src: string;
  type: 'image' | 'video';
  caption: string;
  order: number;
};

type ProfileData = {
  name: string;
  subtitle: string;
  bio: string;
  slides: ProfileSlide[];
};

function isVideo(src: string, type?: string): boolean {
  if (type === 'video') return true;
  if (type === 'image') return false;
  return /\.(mp4|webm|ogg|mov)$/i.test(src);
}

export default function ProfileBanner() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    fetch('/api/profile')
      .then(res => res.json())
      .then((data: ProfileData & { error?: string }) => {
        if (data && !data.error) setProfile(data);
      })
      .catch(() => {});
  }, []);

  const slides = profile?.slides || [];
  const hasSlides = slides.length > 0;

  const goTo = useCallback(
    (index: number) => {
      if (isTransitioning || slides.length === 0) return;
      setIsTransitioning(true);
      setCurrent(index);
      setTimeout(() => setIsTransitioning(false), 600);
    },
    [isTransitioning, slides.length]
  );

  const next = useCallback(() => {
    if (slides.length <= 1) return;
    goTo((current + 1) % slides.length);
  }, [current, slides.length, goTo]);

  // Auto-advance
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [next, slides.length]);

  // Video playback
  useEffect(() => {
    if (!hasSlides) return;
    videoRefs.current.forEach((vid, i) => {
      if (!vid) return;
      if (i === current && isVideo(slides[i].src, slides[i].type)) {
        vid.currentTime = 0;
        vid.play().catch(() => {});
      } else {
        vid.pause();
      }
    });
  }, [current, hasSlides, slides]);

  // Don't render if no profile data or no slides
  if (!profile || slides.length === 0) return null;

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-zinc-800/50 bg-zinc-900/40 group flex flex-col">
      {/* Media area */}
      <div className="relative flex-1 min-h-0">
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            className="absolute inset-0 transition-all duration-600 ease-in-out"
            style={{
              opacity: i === current ? 1 : 0,
              transform: i === current ? 'scale(1)' : 'scale(1.03)',
            }}
          >
            {isVideo(slide.src, slide.type) ? (
              <video
                ref={el => { videoRefs.current[i] = el; }}
                src={slide.src}
                muted
                playsInline
                loop
                preload={i === 0 ? 'auto' : 'metadata'}
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={slide.src}
                alt={slide.caption || profile.name}
                className="w-full h-full object-cover"
                loading={i === 0 ? 'eager' : 'lazy'}
              />
            )}
          </div>
        ))}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/30 to-zinc-950/10" />

        {/* Navigation arrows */}
        {slides.length > 1 && (
          <>
            <button
              onClick={() => goTo((current - 1 + slides.length) % slides.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-zinc-950/50 backdrop-blur-sm border border-zinc-700/40 flex items-center justify-center text-zinc-400 hover:text-zinc-100 transition opacity-0 group-hover:opacity-100 text-xs"
              aria-label="Anterior"
            >
              ‹
            </button>
            <button
              onClick={() => goTo((current + 1) % slides.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-zinc-950/50 backdrop-blur-sm border border-zinc-700/40 flex items-center justify-center text-zinc-400 hover:text-zinc-100 transition opacity-0 group-hover:opacity-100 text-xs"
              aria-label="Siguiente"
            >
              ›
            </button>
          </>
        )}

        {/* Text overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
          {slides[current]?.caption && (
            <p
              className="text-[10px] text-emerald-400/60 uppercase tracking-widest mb-1.5"
              style={{
                opacity: isTransitioning ? 0 : 1,
                transform: isTransitioning ? 'translateY(6px)' : 'translateY(0)',
                transition: 'all 0.4s ease 0.15s',
              }}
            >
              {slides[current].caption}
            </p>
          )}
          <h3
            className="text-base sm:text-lg font-bold text-zinc-50 tracking-tight leading-tight"
            style={{
              opacity: isTransitioning ? 0 : 1,
              transform: isTransitioning ? 'translateY(8px)' : 'translateY(0)',
              transition: 'all 0.4s ease 0.2s',
            }}
          >
            {profile.name}
          </h3>
          {profile.subtitle && (
            <p
              className="text-[11px] text-zinc-400 mt-1"
              style={{
                opacity: isTransitioning ? 0 : 1,
                transform: isTransitioning ? 'translateY(6px)' : 'translateY(0)',
                transition: 'all 0.4s ease 0.25s',
              }}
            >
              {profile.subtitle}
            </p>
          )}
        </div>

        {/* Dots */}
        {slides.length > 1 && (
          <div className="absolute top-3 right-3 flex gap-1">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-400 ${
                  i === current ? 'bg-emerald-400/70 w-4' : 'bg-zinc-500/40 hover:bg-zinc-400/60'
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
