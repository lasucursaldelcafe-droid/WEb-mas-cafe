"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setError("Contraseña incorrecta");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-blue-deep px-6">
      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="w-full max-w-md space-y-8 rounded-[2rem_4rem_2rem_4rem] bg-cream p-10 organic-shadow"
      >
        <div className="text-center">
          <Image
            src="/images/brand/horizontal-azul.png"
            alt="Más Café"
            width={160}
            height={48}
            className="mx-auto h-12 w-auto"
          />
          <p className="mt-4 text-sm text-charcoal/60">Panel de administración</p>
        </div>
        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-blue-deep/10 px-4 py-3 outline-none focus:border-blue-deep"
            placeholder="••••••••"
          />
          {error && <p className="mt-2 text-sm text-cherry">{error}</p>}
        </div>
        <button
          type="submit"
          className="w-full rounded-full bg-blue-deep py-4 text-sm font-bold text-cream"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
