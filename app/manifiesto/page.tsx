import Layout from '../../components/Layout';

export default function ManifiestoPage() {
  return (
    <Layout>
      <article className="max-w-2xl mx-auto animate-fade-in-up">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4 tracking-tight">Manifiesto</h1>
          <div className="w-16 h-0.5 bg-gradient-to-r from-emerald-600 to-amber-600 mx-auto rounded-full" />
        </div>

        <div className="space-y-6 font-editorial text-zinc-300 leading-relaxed text-[15px]">
          <p className="text-lg text-zinc-200 font-medium">
            Este es mi espacio para hablar y publicar todos los temas que me gustan y quiero compartir, así como dar opiniones de muchos de ellos.
          </p>

          <p>
            Archivo ALSIL es donde escribo lo que estudio, lo que disfruto, y en general lo que tiene significado para mí.
          </p>

          <div className="my-8 space-y-2 text-zinc-400 italic border-l-2 border-emerald-700/50 pl-6 py-2">
            <p>A veces será ingeniería.</p>
            <p>A veces política.</p>
            <p>A veces música, fútbol o cosas de la cultura pop.</p>
          </div>

          <p className="mt-8 text-zinc-400 text-sm text-center">
            Si alguna idea te hace pensar, cuestionar o ver algo distinto, ya cumplió su propósito.
          </p>
        </div>
      </article>
    </Layout>
  );
}
