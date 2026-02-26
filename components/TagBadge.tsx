export default function TagBadge({ tag }: { tag: string }) {
  return (
    <span className="bg-gray-700 text-xs px-2 py-1 rounded font-mono text-gray-200">#{tag}</span>
  );
}
