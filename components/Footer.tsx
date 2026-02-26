export default function Footer() {
  return (
    <footer className="py-6 border-t border-emerald-900/20 text-center text-sm text-zinc-500">
      <div><span className="text-amber-400/30">Archivo Alsil</span> &copy; {new Date().getFullYear()} · <span className="text-emerald-600/50">Miguel Ángel Álvarez Silva</span></div>
    </footer>
  );
}
