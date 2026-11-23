"use client";
import { Fragment, useActionState, useState } from "react";
import type { Profile, Role } from "@/lib/auth";
import { ROLE_LABEL } from "@/lib/constants";
import DeleteButton from "@/components/DeleteButton";
import { createUser, updateUser, deleteUser } from "./actions";

function Msg({ s }: { s?: { error?: string; ok?: string } }) {
  if (!s) return null;
  if (s.error) return <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{s.error}</p>;
  if (s.ok) return <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{s.ok}</p>;
  return null;
}

function RoleSelect({ me, defaultValue, name = "role" }: { me: Profile; defaultValue: Role; name?: string }) {
  const roles: Role[] = me.role === "superadmin" ? ["superadmin", "admin", "operator", "viewer"] : ["operator", "viewer"];
  return (
    <select name={name} defaultValue={defaultValue} className="input">
      {roles.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
    </select>
  );
}

function EditRow({ u, me, onDone }: { u: Profile; me: Profile; onDone: () => void }) {
  const [state, action, pending] = useActionState(updateUser, undefined);
  return (
    <tr className="bg-stone-50">
      <td colSpan={4}>
        <form action={action} className="grid gap-3 py-2 md:grid-cols-4">
          <input type="hidden" name="id" value={u.id} />
          <div><label className="label">Nama lengkap</label><input name="full_name" defaultValue={u.full_name ?? ""} className="input" /></div>
          <div><label className="label">Peran</label><RoleSelect me={me} defaultValue={u.role} /></div>
          <div><label className="label">Password baru (opsional)</label><input name="password" type="password" minLength={8} className="input" placeholder="kosongkan jika tidak diubah" /></div>
          <div className="flex items-end gap-2">
            <button className="btn-primary" disabled={pending}>Simpan</button>
            <button type="button" className="btn-secondary" onClick={onDone}>Tutup</button>
          </div>
          <div className="md:col-span-4"><Msg s={state} /></div>
        </form>
      </td>
    </tr>
  );
}

export default function UsersClient({ me, users }: { me: Profile; users: (Profile & { created_at: string })[] }) {
  const [state, action, pending] = useActionState(createUser, undefined);
  const [editing, setEditing] = useState<string | null>(null);
  const manageable = (u: Profile) => me.role === "superadmin" || u.role === "operator" || u.role === "viewer";

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="h1">Manajemen User</h1>
        <p className="text-sm text-stone-500">
          Superuser dapat mengelola semua user. Administrator dapat mengelola Operator dan Viewer.
        </p>
      </div>

      <form action={action} className="card space-y-4">
        <h2 className="font-semibold">Tambah User</h2>
        <div className="grid gap-3 md:grid-cols-4">
          <div><label className="label">Username *</label><input name="username" className="input" required autoCapitalize="none" placeholder="mis. pw.jabar" /></div>
          <div><label className="label">Nama lengkap</label><input name="full_name" className="input" /></div>
          <div><label className="label">Password * (min. 8)</label><input name="password" type="password" minLength={8} className="input" required /></div>
          <div><label className="label">Peran</label><RoleSelect me={me} defaultValue="operator" /></div>
        </div>
        <Msg s={state} />
        <button className="btn-primary" disabled={pending}>{pending ? "Membuat..." : "Tambah User"}</button>
      </form>

      <div className="card overflow-x-auto p-0">
        <table className="table">
          <thead><tr><th>Username</th><th>Nama</th><th>Peran</th><th></th></tr></thead>
          <tbody>
            {users.map((u) => (
              <Fragment key={u.id}>
                <tr>
                  <td className="font-medium">{u.username}{u.id === me.id && <span className="ml-1 text-xs text-stone-400">(Anda)</span>}</td>
                  <td>{u.full_name ?? "—"}</td>
                  <td>{ROLE_LABEL[u.role]}</td>
                  <td className="text-right">
                    {manageable(u) && (
                      <div className="flex justify-end gap-1">
                        <button className="btn-secondary btn-sm" onClick={() => setEditing(editing === u.id ? null : u.id)}>Edit</button>
                        {u.id !== me.id && (
                          <DeleteButton action={deleteUser.bind(null, u.id)} confirmText={`Hapus user ${u.username}?`} />
                        )}
                      </div>
                    )}
                  </td>
                </tr>
                {editing === u.id && <EditRow u={u} me={me} onDone={() => setEditing(null)} />}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
