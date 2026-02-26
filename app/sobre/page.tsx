import Layout from '../../components/Layout';

export default function SobrePage() {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto animate-fade-in-up">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4 tracking-tight">Sobre</h1>
          <div className="w-16 h-0.5 bg-gradient-to-r from-emerald-600 to-amber-600 mx-auto rounded-full" />
        </div>

        <div className="flex flex-col items-center mb-10">
          <img src="/uploads/logo.png" alt="Archivo ALSIL" className="w-28 h-28 rounded-full border-2 border-emerald-800/30 mb-4" />
          <h2 className="text-xl font-semibold text-amber-200/80">Archivo ALSIL</h2>
          <p className="text-zinc-500 text-sm mt-1">Análisis · Opinión · Cultura</p>
        </div>

        <div className="space-y-5 font-editorial text-zinc-300 leading-relaxed text-[15px]">
          <p>
            Este archivo editorial explora ideas, análisis y opiniones sobre diversos temas: desde ciencia e ingeniería hasta política, arte y cultura.
          </p>
          <p>
            Archivo ALSIL es una página desarrollada por el estudiante de ingeniería <span className="text-amber-200/80 font-semibold">Miguel Ángel Álvarez Silva</span>.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-3 gap-4 text-center">
          {[
            { label: 'Categorías', value: '8+' },
            { label: 'Temas', value: 'Diversos' },
            { label: 'Enfoque', value: 'Profundo' },
          ].map(s => (
            <div key={s.label} className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
              <div className="text-lg font-bold text-emerald-500/60">{s.value}</div>
              <div className="text-[10px] uppercase tracking-widest text-zinc-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
