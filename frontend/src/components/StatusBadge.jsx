export default function StatusBadge({ quantity }) {
  if (quantity <= 0) {
    return <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-danger">Out of Stock</span>;
  }
  if (quantity <= 5) {
    return <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-warning">Low Stock</span>;
  }
  return <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-success">In Stock</span>;
}
