import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { getProfile, canManageUsers } from "@/lib/auth";
import { ROLE_LABEL } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const items = [
    { href: "/", label: "Dashboard" },
    { href: "/pw", label: "Pengurus Wilayah (PW)" },
    { href: "/pd", label: "Pengurus Daerah (PD)" },
    { href: "/daerah", label: "Identifikasi Daerah" },
    { href: "/tbm", label: "Anggota TBM" },
    { href: "/portofolio", label: "Portofolio TBM" },
    ...(canManageUsers(profile.role) ? [{ href: "/users", label: "Manajemen User" }] : []),
    { href: "/akun", label: "Akun Saya" },
  ];

  return (
    <div className="min-h-screen">
      <Sidebar items={items} user={profile.full_name || profile.username} role={ROLE_LABEL[profile.role]} />
      <main className="p-4 lg:ml-64 lg:p-8">{children}</main>
    </div>
  );
}
