import { LockKeyhole } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import logo from "../assets/StockPilot-logo.svg";
import api, { getErrorMessage } from "../services/api.js";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  function updateForm(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submitLogin(event) {
    event.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/login", {
        email: form.email.trim(),
        password: form.password
      });
      localStorage.setItem("StockPilot_token", res.data.access_token);
      toast.success("Signed in");
      navigate("/");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <img src={logo} alt="StockPilot" className="h-12 w-auto" />
        <div className="mt-8">
          <h1 className="text-2xl font-semibold text-text">Inventory manager login</h1>
          <p className="mt-2 text-sm text-muted">Sign in to manage inventory and customer orders.</p>
        </div>

        <form onSubmit={submitLogin} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-secondary">Email</span>
            <input className="form-input" name="email" type="email" value={form.email} onChange={updateForm} autoComplete="email" required />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-secondary">Password</span>
            <input className="form-input" name="password" type="password" value={form.password} onChange={updateForm} autoComplete="current-password" required />
          </label>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            <LockKeyhole size={17} />
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}
