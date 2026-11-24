"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PortoTabs({ canEdit }: { canEdit: boolean }) {
  const path = usePathname();
  const tabs = [
    { href: "/portofolio", label: "Pencarian" },
    { href: "/portofolio/filter", label: "Filter TBM" },
    ...(canEdit ? [{ href: "/portofolio/update", label: "Update Portofolio" }] : []),
  ];
  return (
    <nav className="flex gap-1 border-b border-stone-200">
      {tabs.map((t) => {
        const active = t.href === "/portofolio" ? path === "/portofolio" : path.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${
              active ? "border-emerald-700 text-emerald-800" : "border-transparent text-stone-600 hover:text-stone-900"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
