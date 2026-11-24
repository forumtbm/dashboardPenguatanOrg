import { Fragment } from "react";

export function keywords(q?: string | null) {
  return (q ?? "").toLowerCase().split(/\s+/).map((s) => s.trim()).filter(Boolean);
}

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Potong teks di sekitar kata kunci pertama yang ditemukan */
export function excerpt(text: string | null | undefined, words: string[], len = 260) {
  if (!text) return "";
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= len) return t;
  const lower = t.toLowerCase();
  const idx = words.map((w) => lower.indexOf(w)).filter((i) => i >= 0).sort((a, b) => a - b)[0] ?? 0;
  const start = Math.max(0, idx - 80);
  const end = Math.min(t.length, start + len);
  return (start > 0 ? "… " : "") + t.slice(start, end) + (end < t.length ? " …" : "");
}

export function Highlight({ text, words }: { text: string | null | undefined; words: string[] }) {
  if (!text) return null;
  if (!words.length) return <>{text}</>;
  const re = new RegExp(`(${words.map(esc).join("|")})`, "gi");
  const parts = text.split(re);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? <mark key={i} className="rounded bg-yellow-200 px-0.5">{p}</mark> : <Fragment key={i}>{p}</Fragment>
      )}
    </>
  );
}
