import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-zinc-950/80 backdrop-blur-md border-b border-emerald-900/30 sticky top-0 z-50">
      <nav className="max-w-[1400px] mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8 h-14">
        <Link href="/" className="text-xl font-semibold tracking-widest font-serif text-amber-100/90 hover:text-emerald-400 transition">
          Archivo ALSIL
        </Link>
        <div className="flex items-center gap-5 text-sm">
          <Link href="/" className="text-zinc-500 hover:text-amber-300/70 transition">Inicio</Link>
          <Link href="/archivo" className="text-zinc-500 hover:text-amber-300/70 transition">Archivo</Link>
          <Link href="/biblioteca" className="text-zinc-500 hover:text-amber-300/70 transition">Biblioteca</Link>
          <Link href="/redes" className="text-zinc-500 hover:text-amber-300/70 transition">Redes</Link>
          <Link href="/sobre" className="text-zinc-500 hover:text-amber-300/70 transition">Sobre</Link>
          <Link href="/manifiesto" className="text-zinc-500 hover:text-amber-300/70 transition">Manifiesto</Link>
          <Link href="/admin" className="ml-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition text-xs font-semibold">+ Crear</Link>
        </div>
      </nav>
    </header>
  );
}
