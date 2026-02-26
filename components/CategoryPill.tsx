export default function CategoryPill({ category }: { category: string }) {
  return (
    <span className="bg-gray-900 text-xs px-3 py-1 rounded-full font-semibold text-gray-300 border border-gray-700 mr-2">{category}</span>
  );
}
