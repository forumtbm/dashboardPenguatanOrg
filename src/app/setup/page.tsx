import { redirect } from "next/navigation";
import { isSetupOpen } from "./actions";
import SetupForm from "./SetupForm";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  let open = false;
  try {
    open = await isSetupOpen();
  } catch (e) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <div className="card max-w-md text-sm text-red-700">
          Konfigurasi belum lengkap: {(e as Error).message}. Pastikan environment variables Supabase sudah diisi
          dan file SQL sudah dijalankan.
        </div>
      </main>
    );
  }
  if (!open) redirect("/login");
  return <SetupForm />;
}
