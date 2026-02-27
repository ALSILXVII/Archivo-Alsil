'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/', label: 'Inicio' },
  { href: '/archivo', label: 'Archivo' },
  { href: '/biblioteca', label: 'Biblioteca' },
  { href: '/redes', label: 'Redes' },
  { href: '/sobre', label: 'Sobre' },
  { href: '/manifiesto', label: 'Manifiesto' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="bg-zinc-950/80 backdrop-blur-md border-b border-emerald-900/30 sticky top-0 z-50">
      <nav className="max-w-[1400px] mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8 h-14">
        {/* Logo */}
        <Link href="/" className="text-lg sm:text-xl font-semibold tracking-widest font-serif text-amber-100/90 hover:text-emerald-400 transition">
          Archivo ALSIL
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-5 text-sm">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition ${pathname === link.href ? 'text-amber-300/80' : 'text-zinc-500 hover:text-amber-300/70'}`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/admin"
            className="ml-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition text-xs font-semibold"
          >
            + Crear
          </Link>
        </div>

        {/* Mobile hamburger button */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden flex flex-col justify-center items-center w-9 h-9 rounded-lg hover:bg-zinc-800/50 transition"
          aria-label="Menú"
        >
          <span className={`block w-5 h-0.5 bg-zinc-400 transition-all duration-300 ${open ? 'rotate-45 translate-y-1.5' : ''}`} />
          <span className={`block w-5 h-0.5 bg-zinc-400 my-1 transition-all duration-300 ${open ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-0.5 bg-zinc-400 transition-all duration-300 ${open ? '-rotate-45 -translate-y-1.5' : ''}`} />
        </button>
      </nav>

      {/* Mobile menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ${open ? 'max-h-96 border-t border-zinc-800/50' : 'max-h-0'}`}>
        <div className="px-4 py-4 space-y-1 bg-zinc-950/95 backdrop-blur-lg">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`block px-4 py-3 rounded-xl text-sm transition ${
                pathname === link.href
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-800/30'
                  : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/admin"
            onClick={() => setOpen(false)}
            className="block px-4 py-3 rounded-xl text-sm bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition text-center font-semibold mt-2"
          >
            + Crear
          </Link>
        </div>
      </div>
    </header>
  );
}
