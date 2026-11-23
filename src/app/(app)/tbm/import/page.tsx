import { redirect } from "next/navigation";
import { requireProfile, canEdit } from "@/lib/auth";
import ImportClient from "./ImportClient";

export default async function ImportPage() {
  const p = await requireProfile();
  if (!canEdit(p.role)) redirect("/tbm");
  return <ImportClient />;
}
