import { requireProfile } from "@/lib/auth";
import { ROLE_LABEL } from "@/lib/constants";
import PasswordForm from "./PasswordForm";

export default async function AkunPage() {
  const me = await requireProfile();
  return (
    <div className="max-w-md space-y-5">
      <h1 className="h1">Akun Saya</h1>
      <div className="card text-sm">
        <div><span className="text-stone-500">Username:</span> <b>{me.username}</b></div>
        <div><span className="text-stone-500">Nama:</span> {me.full_name ?? "—"}</div>
        <div><span className="text-stone-500">Peran:</span> {ROLE_LABEL[me.role]}</div>
      </div>
      <PasswordForm />
    </div>
  );
}
