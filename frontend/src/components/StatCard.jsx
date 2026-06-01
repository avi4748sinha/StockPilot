export default function StatCard({ title, value, icon: Icon, tone = "blue" }) {
  const tones = {
    blue: "bg-blue-50 text-primary",
    green: "bg-emerald-50 text-success",
    amber: "bg-amber-50 text-warning",
    gray: "bg-gray-100 text-secondary"
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-text">{value}</p>
        </div>
        <div className={`rounded-md p-3 ${tones[tone]}`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}
