'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';

type Slide = {
  src: string;
  type?: 'image' | 'video';
  title?: string;
  subtitle?: string;
  link?: string;
};

function isVideo(src: string, explicitType?: string): boolean {
  if (explicitType === 'video') return true;
  if (explicitType === 'image') return false;
  return /\.(mp4|webm|ogg|mov)$/i.test(src);
}

const defaultSlides: Slide[] = [
  {
    src: '/uploads/hero-1.jpg',
    title: 'Archivo ALSIL',
    subtitle: 'Análisis, opinión y cultura',
  },
  {
    src: '/uploads/hero-2.jpg',
    title: 'Ciencia y Tecnología',
    subtitle: 'Explorando el futuro',
  },
  {
    src: '/uploads/hero-3.jpg',
    title: 'Arte y Cultura',
    subtitle: 'Perspectivas que importan',
  },
  {
    src: '/uploads/hero-4.jpg',
    title: 'Política y Sociedad',
    subtitle: 'Entendiendo nuestro mundo',
  },
];

export default function HeroCarousel({
  slides,
  interval = 5000,
}: {
  slides?: Slide[];
  interval?: number;
}) {
  const [fetchedSlides, setFetchedSlides] = useState<Slide[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Fetch slides from API on mount
  useEffect(() => {
    if (slides && slides.length > 0) {
      setLoaded(true);
      return;
    }
    fetch('/api/hero')
      .then(res => res.json())
      .then((data: Slide[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setFetchedSlides(data);
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [slides]);

  const items = (slides && slides.length > 0)
    ? slides
    : fetchedSlides.length > 0
      ? fetchedSlides
      : defaultSlides;
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [slideDuration, setSlideDuration] = useState(interval);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const goTo = useCallback(
    (index: number) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setCurrent(index);
      setTimeout(() => setIsTransitioning(false), 700);
    },
    [isTransitioning]
  );

  const next = useCallback(() => {
    goTo((current + 1) % items.length);
  }, [current, items.length, goTo]);

  // Handle video playback and dynamic duration
  useEffect(() => {
    const slide = items[current];
    const isVid = isVideo(slide.src, slide.type);

    // Pause all videos, play current if video
    videoRefs.current.forEach((vid, i) => {
      if (!vid) return;
      if (i === current && isVid) {
        vid.currentTime = 0;
        vid.play().catch(() => {});
      } else {
        vid.pause();
      }
    });

    if (isVid) {
      const vid = videoRefs.current[current];
      if (vid && vid.duration && isFinite(vid.duration)) {
        setSlideDuration(vid.duration * 1000);
      } else {
        // Wait for metadata to get duration
        setSlideDuration(10000); // fallback
        const handler = () => {
          if (vid && vid.duration && isFinite(vid.duration)) {
            setSlideDuration(vid.duration * 1000);
          }
        };
        vid?.addEventListener('loadedmetadata', handler);
        return () => vid?.removeEventListener('loadedmetadata', handler);
      }
    } else {
      setSlideDuration(interval);
    }
  }, [current, items, interval]);

  // Auto-advance
  useEffect(() => {
    const timer = setInterval(next, slideDuration);
    return () => clearInterval(timer);
  }, [next, slideDuration]);

  const slide = items[current];

  const Wrapper = slide.link ? Link : 'div';
  const wrapperProps = slide.link
    ? { href: slide.link }
    : {};

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-zinc-800/50 bg-zinc-900/40 group">
      {/* Aspect ratio container */}
      <div className="relative aspect-[16/9] sm:aspect-[16/10] lg:aspect-[16/12]">
        {/* Media (images & videos) */}
        {items.map((item, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-all duration-700 ease-in-out"
            style={{
              opacity: i === current ? 1 : 0,
              transform: i === current ? 'scale(1)' : 'scale(1.05)',
            }}
          >
            {isVideo(item.src, item.type) ? (
              <video
                ref={el => { videoRefs.current[i] = el; }}
                src={item.src}
                muted
                playsInline
                preload={i === 0 ? 'auto' : 'metadata'}
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={item.src}
                alt={item.title || `Slide ${i + 1}`}
                className="w-full h-full object-cover"
                loading={i === 0 ? 'eager' : 'lazy'}
              />
            )}
          </div>
        ))}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/30 to-transparent" />

        {/* Text content */}
        {(slide.title || slide.subtitle) && (
          <Wrapper
            {...wrapperProps as any}
            className="absolute bottom-0 left-0 right-0 p-6 sm:p-8"
          >
            {slide.subtitle && (
              <p className="text-emerald-400/70 text-[10px] sm:text-xs font-semibold uppercase tracking-widest mb-2 transition-transform duration-500"
                style={{
                  transform: isTransitioning ? 'translateY(8px)' : 'translateY(0)',
                  opacity: isTransitioning ? 0 : 1,
                  transition: 'all 0.5s ease 0.2s',
                }}
              >
                {slide.subtitle}
              </p>
            )}
            {slide.title && (
              <h2
                className="text-xl sm:text-2xl lg:text-3xl font-bold text-zinc-50 tracking-tight leading-tight"
                style={{
                  transform: isTransitioning ? 'translateY(12px)' : 'translateY(0)',
                  opacity: isTransitioning ? 0 : 1,
                  transition: 'all 0.5s ease 0.3s',
                }}
              >
                {slide.title}
              </h2>
            )}
          </Wrapper>
        )}

        {/* Navigation arrows */}
        <button
          onClick={() => goTo((current - 1 + items.length) % items.length)}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-zinc-950/50 backdrop-blur-sm border border-zinc-700/40 flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-950/70 transition opacity-0 group-hover:opacity-100"
          aria-label="Anterior"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={() => goTo((current + 1) % items.length)}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-zinc-950/50 backdrop-blur-sm border border-zinc-700/40 flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-950/70 transition opacity-0 group-hover:opacity-100"
          aria-label="Siguiente"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Dots */}
        <div className="absolute bottom-3 right-6 sm:right-8 flex gap-1.5">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-1 rounded-full transition-all duration-500 ${
                i === current
                  ? 'w-6 bg-emerald-400/70'
                  : 'w-1.5 bg-zinc-500/40 hover:bg-zinc-400/60'
              }`}
              aria-label={`Ir a slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-zinc-800/30">
          <div
            className="h-full bg-gradient-to-r from-emerald-500/50 to-amber-500/50"
            style={{
              animation: `progress ${slideDuration}ms linear 1 forwards`,
              width: '100%',
            }}
            key={current}
          />
        </div>
      </div>
    </div>
  );
}
