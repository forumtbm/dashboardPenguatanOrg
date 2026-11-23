"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type Item = { href: string; label: string };

export default function Sidebar({ items, user, role }: { items: Item[]; user: string; role: string }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));
  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-stone-200 bg-white px-4 py-3 lg:hidden">
        <span className="font-bold text-emerald-800">Dashboard PO</span>
        <button className="btn-secondary btn-sm" onClick={() => setOpen(!open)} aria-expanded={open}>Menu</button>
      </header>
      <aside
        className={`${open ? "block" : "hidden"} fixed inset-y-0 left-0 z-40 w-64 overflow-y-auto border-r border-stone-200 bg-white lg:block`}
      >
        <div className="border-b border-stone-100 px-5 py-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Forum TBM</div>
          <div className="text-lg font-bold leading-tight">Penguatan Organisasi</div>
        </div>
        <nav className="space-y-0.5 p-3">
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              onClick={() => setOpen(false)}
              className={`block rounded-lg px-3 py-2 text-sm font-medium ${
                isActive(it.href) ? "bg-emerald-50 text-emerald-800" : "text-stone-700 hover:bg-stone-50"
              }`}
            >
              {it.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-stone-100 p-4 text-sm">
          <div className="font-semibold">{user}</div>
          <div className="mb-3 text-xs text-stone-500">{role}</div>
          <form action="/logout" method="post">
            <button className="btn-secondary btn-sm w-full">Keluar</button>
          </form>
        </div>
      </aside>
      {open && <div className="fixed inset-0 z-30 bg-black/20 lg:hidden" onClick={() => setOpen(false)} />}
    </>
  );
}
