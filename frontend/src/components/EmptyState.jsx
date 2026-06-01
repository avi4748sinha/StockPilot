export default function EmptyState({ title, message }) {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 bg-white px-6 py-10 text-center">
      <h3 className="text-sm font-semibold text-text">{title}</h3>
      <p className="mt-1 text-sm text-muted">{message}</p>
    </div>
  );
}
