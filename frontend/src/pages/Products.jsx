import { Edit2, Plus, Search, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import EmptyState from "../components/EmptyState.jsx";
import PageHeader from "../components/PageHeader.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import api, { getErrorMessage } from "../services/api.js";

const blankProduct = { name: "", sku: "", price: "", discount_percent: "0", image_url: "", quantity_in_stock: "" };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(blankProduct);
  const [editingId, setEditingId] = useState(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadProducts() {
    setLoading(true);
    const res = await api.get("/products");
    setProducts(res.data);
    setLoading(false);
  }

  useEffect(() => {
    loadProducts().catch((error) => {
      toast.error(getErrorMessage(error));
      setLoading(false);
    });
  }, []);

  const filteredProducts = useMemo(() => {
    const value = query.toLowerCase();
    return products.filter(
      (product) => product.name.toLowerCase().includes(value) || product.sku.toLowerCase().includes(value)
    );
  }, [products, query]);

  function updateForm(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function editProduct(product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      sku: product.sku,
      price: product.price,
      discount_percent: product.discount_percent || 0,
      image_url: product.image_url || "",
      quantity_in_stock: product.quantity_in_stock
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(blankProduct);
  }

  async function submitProduct(event) {
    event.preventDefault();
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      price: Number(form.price),
      discount_percent: Number(form.discount_percent) || 0,
      image_url: form.image_url.trim() || null,
      quantity_in_stock: Number(form.quantity_in_stock)
    };

    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
        toast.success("Product updated");
      } else {
        await api.post("/products", payload);
        toast.success("Product added");
      }
      resetForm();
      await loadProducts();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function removeProduct(productId) {
    if (!window.confirm("Delete this product?")) return;
    try {
      await api.delete(`/products/${productId}`);
      toast.success("Product deleted");
      await loadProducts();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <>
      <PageHeader title="Products" description="Manage item details, SKU codes, price, and stock levels." />

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-text">{editingId ? "Edit product" : "Add product"}</h2>
            {editingId ? (
              <button type="button" onClick={resetForm} className="btn-secondary" title="Cancel edit">
                <X size={16} />
                Cancel
              </button>
            ) : null}
          </div>
          <form onSubmit={submitProduct} className="space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-secondary">Product name</span>
              <input className="form-input" name="name" value={form.name} onChange={updateForm} required minLength={2} />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-secondary">SKU</span>
              <input className="form-input" name="sku" value={form.sku} onChange={updateForm} required minLength={2} />
            </label>
            <div className="grid grid-cols-3 gap-3">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-secondary">Price</span>
                <input className="form-input" name="price" type="number" step="0.01" min="0.01" value={form.price} onChange={updateForm} required />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-secondary">Discount</span>
                <input className="form-input" name="discount_percent" type="number" step="0.01" min="0" max="90" value={form.discount_percent} onChange={updateForm} />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-secondary">Stock</span>
                <input className="form-input" name="quantity_in_stock" type="number" min="0" value={form.quantity_in_stock} onChange={updateForm} required />
              </label>
            </div>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-secondary">Image URL</span>
              <input className="form-input" name="image_url" type="url" value={form.image_url} onChange={updateForm} placeholder="https://example.com/product.jpg" />
            </label>
            {form.image_url ? (
              <div className="rounded-md border border-gray-200 p-2">
                <img src={form.image_url} alt="Product preview" className="h-28 w-full rounded object-cover" onError={(event) => { event.currentTarget.style.display = "none"; }} />
              </div>
            ) : null}
            <button type="submit" className="btn-primary w-full" disabled={saving}>
              <Plus size={17} />
              {editingId ? "Save changes" : "Add product"}
            </button>
          </form>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-base font-semibold text-text">Product list</h2>
            <div className="relative sm:w-72">
              <Search className="absolute left-3 top-2.5 text-muted" size={17} />
              <input className="form-input search-input" placeholder="Search products" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-muted">Loading...</p>
          ) : filteredProducts.length === 0 ? (
            <EmptyState title="No products found" message="Add a product or adjust the search term." />
          ) : (
            <div className="table-wrap">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead>
                  <tr className="text-left text-xs font-semibold uppercase tracking-wide text-muted">
                    <th className="px-3 py-3">Product</th>
                    <th className="px-3 py-3">SKU</th>
                    <th className="px-3 py-3">Price</th>
                    <th className="px-3 py-3">Discount</th>
                    <th className="px-3 py-3">Stock</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          {product.image_url ? (
                            <img src={product.image_url} alt="" className="h-10 w-10 rounded-md object-cover" />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-[10px] font-medium text-muted">No Image</div>
                          )}
                          <span className="font-medium text-text">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-muted">{product.sku}</td>
                      <td className="px-3 py-3 text-text">Rs. {Number(product.price).toFixed(2)}</td>
                      <td className="px-3 py-3 text-muted">{Number(product.discount_percent || 0).toFixed(0)}%</td>
                      <td className="px-3 py-3 text-text">{product.quantity_in_stock}</td>
                      <td className="px-3 py-3"><StatusBadge quantity={product.quantity_in_stock} /></td>
                      <td className="px-3 py-3">
                        <div className="flex justify-end gap-2">
                          <button className="btn-secondary" onClick={() => editProduct(product)} title="Edit product">
                            <Edit2 size={15} />
                          </button>
                          <button className="btn-danger" onClick={() => removeProduct(product.id)} title="Delete product">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
