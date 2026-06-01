import { Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import EmptyState from "../components/EmptyState.jsx";
import PageHeader from "../components/PageHeader.jsx";
import api, { getErrorMessage } from "../services/api.js";

const blankCustomer = { full_name: "", email: "", phone: "" };

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(blankCustomer);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadCustomers() {
    setLoading(true);
    const res = await api.get("/customers");
    setCustomers(res.data);
    setLoading(false);
  }

  useEffect(() => {
    loadCustomers().catch((error) => {
      toast.error(getErrorMessage(error));
      setLoading(false);
    });
  }, []);

  const filteredCustomers = useMemo(() => {
    const value = query.toLowerCase();
    return customers.filter(
      (customer) =>
        customer.full_name.toLowerCase().includes(value) ||
        customer.email.toLowerCase().includes(value) ||
        customer.phone.includes(value)
    );
  }, [customers, query]);

  function updateForm(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submitCustomer(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await api.post("/customers", {
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim()
      });
      toast.success("Customer added");
      setForm(blankCustomer);
      await loadCustomers();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function removeCustomer(customerId) {
    if (!window.confirm("Delete this customer?")) return;
    try {
      await api.delete(`/customers/${customerId}`);
      toast.success("Customer deleted");
      await loadCustomers();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <>
      <PageHeader title="Customers" description="Keep a simple customer list for order creation." />

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-text">Add customer</h2>
          <form onSubmit={submitCustomer} className="space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-secondary">Full name</span>
              <input className="form-input" name="full_name" value={form.full_name} onChange={updateForm} required minLength={2} />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-secondary">Email</span>
              <input className="form-input" name="email" type="email" value={form.email} onChange={updateForm} required />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-secondary">Phone</span>
              <input className="form-input" name="phone" value={form.phone} onChange={updateForm} required minLength={7} />
            </label>
            <button type="submit" className="btn-primary w-full" disabled={saving}>
              <Plus size={17} />
              Add customer
            </button>
          </form>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-base font-semibold text-text">Customer list</h2>
            <div className="relative sm:w-72">
              <Search className="absolute left-3 top-2.5 text-muted" size={17} />
              <input className="form-input search-input" placeholder="Search customers" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-muted">Loading...</p>
          ) : filteredCustomers.length === 0 ? (
            <EmptyState title="No customers found" message="Add a customer or adjust the search term." />
          ) : (
            <div className="table-wrap">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead>
                  <tr className="text-left text-xs font-semibold uppercase tracking-wide text-muted">
                    <th className="px-3 py-3">Name</th>
                    <th className="px-3 py-3">Email</th>
                    <th className="px-3 py-3">Phone</th>
                    <th className="px-3 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id}>
                      <td className="px-3 py-3 font-medium text-text">{customer.full_name}</td>
                      <td className="px-3 py-3 text-muted">{customer.email}</td>
                      <td className="px-3 py-3 text-muted">{customer.phone}</td>
                      <td className="px-3 py-3">
                        <div className="flex justify-end">
                          <button className="btn-danger" onClick={() => removeCustomer(customer.id)} title="Delete customer">
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
