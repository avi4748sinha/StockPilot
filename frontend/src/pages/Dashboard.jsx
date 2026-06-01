import { AlertTriangle, Boxes, IndianRupee, ReceiptText, Users } from "lucide-react";
import { useEffect, useState } from "react";

import EmptyState from "../components/EmptyState.jsx";
import PageHeader from "../components/PageHeader.jsx";
import StatCard from "../components/StatCard.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import api from "../services/api.js";
import { formatDate } from "../utils/formatDate.js";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      const [summaryRes, productsRes, ordersRes, activityRes] = await Promise.all([
        api.get("/dashboard"),
        api.get("/products"),
        api.get("/orders"),
        api.get("/activity")
      ]);
      setSummary(summaryRes.data);
      setProducts(productsRes.data);
      setOrders(ordersRes.data.slice(0, 5));
      setActivity(activityRes.data);
      setLoading(false);
    }

    loadDashboard().catch(() => setLoading(false));
  }, []);

  const lowStock = products.filter((product) => product.quantity_in_stock <= 5).slice(0, 5);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="A quick look at inventory levels, customers, and recent orders."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Products" value={summary?.total_products ?? "-"} icon={Boxes} />
        <StatCard title="Customers" value={summary?.total_customers ?? "-"} icon={Users} tone="gray" />
        <StatCard title="Orders" value={summary?.total_orders ?? "-"} icon={ReceiptText} tone="green" />
        <StatCard title="Revenue" value={summary ? `Rs. ${Number(summary.total_revenue).toFixed(0)}` : "-"} icon={IndianRupee} tone="green" />
        <StatCard title="Low stock" value={summary?.low_stock_products ?? "-"} icon={AlertTriangle} tone="amber" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_420px]">
        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-text">Low stock products</h2>
          </div>
          {loading ? (
            <p className="text-sm text-muted">Loading...</p>
          ) : lowStock.length === 0 ? (
            <EmptyState title="No low stock items" message="Products with 5 or fewer units will show up here." />
          ) : (
            <div className="space-y-3">
              {lowStock.map((product) => (
                <div key={product.id} className="flex items-center justify-between rounded-md border border-gray-200 px-4 py-3">
                  <div>
                    <p className="font-medium text-text">{product.name}</p>
                    <p className="text-sm text-muted">{product.sku}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-text">{product.quantity_in_stock}</span>
                    <StatusBadge quantity={product.quantity_in_stock} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-text">Latest activity</h2>
          {loading ? (
            <p className="text-sm text-muted">Loading...</p>
          ) : activity.length === 0 ? (
            <EmptyState title="No activity yet" message="New products, customers, and orders will appear here." />
          ) : (
            <div className="divide-y divide-gray-100">
              {activity.map((item) => (
                <div key={`${item.type}-${item.id}-${item.created_at}`} className="flex items-start justify-between gap-4 py-3">
                  <div>
                    <p className="font-medium text-text">{item.title}</p>
                    <p className="text-sm text-muted">{item.description}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted">{formatDate(item.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="mt-6 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-text">Recent orders</h2>
        {loading ? (
          <p className="text-sm text-muted">Loading...</p>
        ) : orders.length === 0 ? (
          <EmptyState title="No orders yet" message="Created orders will appear here with customer and total amount." />
        ) : (
          <div className="table-wrap">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-muted">
                  <th className="px-3 py-3">Order</th>
                  <th className="px-3 py-3">Customer</th>
                  <th className="px-3 py-3">Items</th>
                  <th className="px-3 py-3">Date</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-3 py-3 font-medium text-text">#{order.id}</td>
                    <td className="px-3 py-3 text-secondary">{order.customer_name}</td>
                    <td className="px-3 py-3 text-muted">{order.items.length}</td>
                    <td className="px-3 py-3 text-muted">{formatDate(order.created_at)}</td>
                    <td className="px-3 py-3"><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-success">Completed</span></td>
                    <td className="px-3 py-3 text-right font-semibold text-text">Rs. {Number(order.total_amount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
