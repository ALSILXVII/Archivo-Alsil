import Layout from '../../components/Layout';
import PostCard from '../../components/PostCard';
import { getAllPosts } from '../../utils/posts';

export const dynamic = 'force-dynamic';

export default function ArchivoPage() {
  const posts = getAllPosts();

  return (
    <Layout>
      <div className="animate-fade-in-up">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight mb-3">Archivo</h1>
          <div className="w-12 h-px bg-gradient-to-r from-emerald-700/40 to-amber-700/40" />
          <p className="text-sm text-zinc-500 mt-3">{posts.length} publicaciones</p>
        </div>
        {posts.length === 0 ? (
          <p className="text-zinc-500 text-center py-16">No hay posts publicados todavía.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {posts.map(post => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
