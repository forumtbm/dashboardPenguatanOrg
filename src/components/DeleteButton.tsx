"use client";
import { useTransition } from "react";

export default function DeleteButton({
  action,
  confirmText = "Hapus data ini? Tindakan ini tidak dapat dibatalkan.",
  label = "Hapus",
}: {
  action: () => Promise<void | { error?: string }>;
  confirmText?: string;
  label?: string;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      className="btn-danger btn-sm"
      disabled={pending}
      onClick={() => {
        if (!window.confirm(confirmText)) return;
        start(async () => {
          const r = await action();
          if (r && "error" in r && r.error) window.alert(r.error);
        });
      }}
    >
      {pending ? "..." : label}
    </button>
  );
}
