import { requireProfile, canEdit } from "@/lib/auth";
import PortoTabs from "@/components/PortoTabs";

export default async function PortoLayout({ children }: { children: React.ReactNode }) {
  const p = await requireProfile();
  return (
    <div className="space-y-5">
      <div>
        <h1 className="h1">Portofolio TBM</h1>
        <p className="text-sm text-stone-500">Catatan portofolio dan kegiatan anggota TBM, beserta pencarian dan filter data TBM.</p>
      </div>
      <PortoTabs canEdit={canEdit(p.role)} />
      {children}
    </div>
  );
}
