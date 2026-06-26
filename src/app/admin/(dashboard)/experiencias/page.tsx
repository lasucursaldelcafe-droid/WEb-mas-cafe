import { getContent } from "@/lib/store";
import AdminExperienciasClient from "./AdminExperienciasClient";

export default async function AdminExperienciasPage() {
  return <AdminExperienciasClient initial={await getContent()} />;
}
