"use client";
import { useActionState } from "react";
import { createFirstSuperuser } from "./actions";

export default function SetupForm() {
  const [state, action, pending] = useActionState(createFirstSuperuser, undefined);
  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-100 p-4">
      <form action={action} className="card w-full max-w-sm space-y-4">
        <div>
          <h1 className="text-xl font-bold">Setup Awal</h1>
          <p className="text-sm text-stone-500">Buat akun Superuser pertama. Halaman ini otomatis terkunci setelah akun dibuat.</p>
        </div>
        <div><label className="label">Nama Lengkap</label><input name="full_name" className="input" required /></div>
        <div><label className="label">Username</label><input name="username" className="input" autoCapitalize="none" required /></div>
        <div><label className="label">Password (min. 8 karakter)</label><input name="password" type="password" className="input" minLength={8} required /></div>
        {state?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
        <button className="btn-primary w-full" disabled={pending}>{pending ? "Membuat..." : "Buat Superuser"}</button>
      </form>
    </main>
  );
}
