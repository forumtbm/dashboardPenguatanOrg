"use client";
import { useActionState } from "react";
import { changePassword } from "./actions";

export default function PasswordForm() {
  const [state, action, pending] = useActionState(changePassword, undefined);
  return (
    <form action={action} className="card space-y-3">
      <h2 className="font-semibold">Ganti Password</h2>
      <div><label className="label">Password lama</label><input name="current" type="password" className="input" required /></div>
      <div><label className="label">Password baru</label><input name="next" type="password" minLength={8} className="input" required /></div>
      <div><label className="label">Ulangi password baru</label><input name="confirm" type="password" minLength={8} className="input" required /></div>
      {state?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      {state?.ok && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{state.ok}</p>}
      <button className="btn-primary" disabled={pending}>Simpan</button>
    </form>
  );
}
