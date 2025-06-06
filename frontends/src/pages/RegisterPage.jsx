// ── File: frontend/src/pages/RegisterPage.jsx ────────────────────────────
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form.email, form.password);
      navigate("/");
    } catch (err) { alert(err.response?.data?.error || err.message); }
  };

  return (
    <div className="container py-5" style={{ maxWidth: 480 }}>
      <h2 className="mb-4">Register</h2>
      <form onSubmit={handleSubmit} className="vstack gap-3">
        <input className="form-control" placeholder="Email" type="email" required
               value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        <input className="form-control" placeholder="Password" type="password" required
               value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
        <button className="btn btn-success" disabled={loading}>{loading ? "..." : "Create Account"}</button>
      </form>
      <p className="mt-3">Already registered? <Link to="/login">Login</Link></p>
    </div>
  );
}
