import { Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import EmptyState from "../components/EmptyState.jsx";
import PageHeader from "../components/PageHeader.jsx";
import api, { getErrorMessage } from "../services/api.js";
import { formatDate } from "../utils/formatDate.js";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadData() {
    setLoading(true);
    const [ordersRes, customersRes, productsRes] = await Promise.all([
      api.get("/orders"),
      api.get("/customers"),
      api.get("/products")
    ]);
    setOrders(ordersRes.data);
    setCustomers(customersRes.data);
    setProducts(productsRes.data);
    setLoading(false);
  }

  useEffect(() => {
    loadData().catch((error) => {
      toast.error(getErrorMessage(error));
      setLoading(false);
    });
  }, []);

  const selectedItems = useMemo(
    () =>
      items.map((item) => {
        const product = products.find((entry) => entry.id === item.product_id);
        return {
          ...item,
          product,
          lineTotal: product ? discountedPrice(product) * item.quantity : 0
        };
      }),
    [items, products]
  );

  const subtotal = selectedItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const discountAmount = subtotal * (Number(discountPercent) || 0) / 100;
  const draftTotal = subtotal - discountAmount;

  function discountedPrice(product) {
    return Number(product.price) * (100 - Number(product.discount_percent || 0)) / 100;
  }

  function addLineItem() {
    const parsedProductId = Number(productId);
    const parsedQuantity = Number(quantity);
    const product = products.find((entry) => entry.id === parsedProductId);

    if (!product) {
      toast.error("Choose a product");
      return;
    }
    if (parsedQuantity < 1) {
      toast.error("Quantity must be at least 1");
      return;
    }
    if (parsedQuantity > product.quantity_in_stock) {
      toast.error(`Only ${product.quantity_in_stock} units available`);
      return;
    }

    setItems((current) => {
      const existing = current.find((item) => item.product_id === parsedProductId);
      const existingQuantity = existing?.quantity || 0;
      if (existingQuantity + parsedQuantity > product.quantity_in_stock) {
        toast.error(`Only ${product.quantity_in_stock} units available`);
        return current;
      }
      if (existing) {
        return current.map((item) =>
          item.product_id === parsedProductId ? { ...item, quantity: item.quantity + parsedQuantity } : item
        );
      }
      return [...current, { product_id: parsedProductId, quantity: parsedQuantity }];
    });
    setProductId("");
    setQuantity(1);
  }

  function removeLineItem(productIdToRemove) {
    setItems((current) => current.filter((item) => item.product_id !== productIdToRemove));
  }

  async function submitOrder(event) {
    event.preventDefault();
    if (!customerId || items.length === 0) {
      toast.error("Choose a customer and at least one product");
      return;
    }

    setSaving(true);
    try {
      await api.post("/orders", {
        customer_id: Number(customerId),
        items,
        discount_percent: Number(discountPercent) || 0
      });
      toast.success("Order created");
      setCustomerId("");
      setDiscountPercent(0);
      setItems([]);
      await loadData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function cancelOrder(orderId) {
    if (!window.confirm("Cancel this order? Stock will be restored.")) return;
    try {
      await api.delete(`/orders/${orderId}`);
      toast.success("Order cancelled");
      await loadData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <>
      <PageHeader title="Orders" description="Create customer orders and let the API calculate totals and deduct stock." />

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-text">Create order</h2>
          <form onSubmit={submitOrder} className="space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-secondary">Customer</span>
              <select className="form-input" value={customerId} onChange={(event) => setCustomerId(event.target.value)} required>
                <option value="">Select customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.full_name}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-[1fr_90px] gap-3">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-secondary">Product</span>
                <select className="form-input" value={productId} onChange={(event) => setProductId(event.target.value)}>
                  <option value="">Select product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id} disabled={product.quantity_in_stock <= 0}>
                      {product.name} ({product.quantity_in_stock})
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-secondary">Qty</span>
                <input className="form-input" type="number" min="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} />
              </label>
            </div>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-secondary">Discount (%)</span>
              <input className="form-input" type="number" min="0" max="50" step="0.01" value={discountPercent} onChange={(event) => setDiscountPercent(event.target.value)} />
            </label>

            <button type="button" className="btn-secondary w-full" onClick={addLineItem}>
              <Plus size={17} />
              Add item
            </button>

            <div className="rounded-md border border-gray-200">
              {selectedItems.length === 0 ? (
                <p className="p-4 text-sm text-muted">No products added yet.</p>
              ) : (
                selectedItems.map((item) => (
                  <div key={item.product_id} className="flex items-center justify-between border-b border-gray-100 px-4 py-3 last:border-b-0">
                    <div>
                      <p className="font-medium text-text">{item.product?.name}</p>
                      <p className="text-sm text-muted">Qty {item.quantity} x Rs. {discountedPrice(item.product).toFixed(2)}</p>
                    </div>
                    <button type="button" className="btn-danger" onClick={() => removeLineItem(item.product_id)} title="Remove item">
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="rounded-md bg-gray-50 px-4 py-3 text-sm">
              <div className="flex items-center justify-between text-secondary">
                <span>Subtotal</span>
                <span>Rs. {subtotal.toFixed(2)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-secondary">
                <span>Discount</span>
                <span>- Rs. {discountAmount.toFixed(2)}</span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3 font-semibold text-text">
                <span>Estimated total</span>
                <span>Rs. {draftTotal.toFixed(2)}</span>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full" disabled={saving}>
              Create order
            </button>
          </form>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-text">Order history</h2>
          {loading ? (
            <p className="text-sm text-muted">Loading...</p>
          ) : orders.length === 0 ? (
            <EmptyState title="No orders yet" message="Orders will show item breakdowns after they are created." />
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-semibold text-text">Order #{order.id}</h3>
                      <p className="text-sm text-muted">{order.customer_name} - {formatDate(order.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-success">Completed</span>
                        <p className="mt-2 font-semibold text-text">Rs. {Number(order.total_amount).toFixed(2)}</p>
                      </div>
                      <button className="btn-danger" onClick={() => cancelOrder(order.id)} title="Cancel order">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                  {Number(order.discount_amount || 0) > 0 ? (
                    <p className="mt-2 text-sm text-muted">Discount {Number(order.discount_percent).toFixed(2)}% - Rs. {Number(order.discount_amount).toFixed(2)}</p>
                  ) : null}
                  <div className="mt-3 divide-y divide-gray-100">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between gap-3 py-2 text-sm">
                        <span className="text-secondary">{item.product_name} ({item.sku})</span>
                        <span className="font-medium text-text">{item.quantity} x Rs. {Number(item.unit_price).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
