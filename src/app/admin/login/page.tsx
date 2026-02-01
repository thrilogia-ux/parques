"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function AdminLoginForm() {
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/admin";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pwd }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error");
        return;
      }
      router.push(from);
      router.refresh();
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-xs">
        <h1 className="text-xl font-semibold mb-4">Admin</h1>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label htmlFor="pwd" className="block text-slate-400 text-sm mb-1">
              Contraseña
            </label>
            <input
              id="pwd"
              type="password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              className="w-full rounded-lg bg-slate-700 px-3 py-2 text-white"
              autoFocus
            />
          </div>
          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 rounded-lg bg-emerald-600 text-white font-medium disabled:opacity-50"
          >
            {loading ? "..." : "Entrar"}
          </button>
        </form>
        <Link href="/" className="block mt-4 text-slate-400 hover:text-white text-sm text-center">
          ← Inicio
        </Link>
      </div>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6"><p className="text-slate-400">Cargando...</p></main>}>
      <AdminLoginForm />
    </Suspense>
  );
}
