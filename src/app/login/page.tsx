"use client";
import { useActionState } from "react";
import { login } from "./actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 to-stone-100 p-4">
      <form action={action} className="card w-full max-w-sm space-y-4">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-700 text-lg font-bold text-white">PO</div>
          <h1 className="text-xl font-bold">Dashboard Penguatan Organisasi</h1>
          <p className="text-sm text-stone-500">Forum Taman Bacaan Masyarakat</p>
        </div>
        <div>
          <label className="label" htmlFor="username">Username</label>
          <input id="username" name="username" className="input" autoComplete="username" autoCapitalize="none" required />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" name="password" type="password" className="input" autoComplete="current-password" required />
        </div>
        {state?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
        <button className="btn-primary w-full" disabled={pending}>{pending ? "Memeriksa..." : "Masuk"}</button>
      </form>
    </main>
  );
}
