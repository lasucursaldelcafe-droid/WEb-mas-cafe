import { getContent } from "@/lib/store";
import AdminConfigClient from "./AdminConfigClient";

export default async function AdminConfigPage() {
  return <AdminConfigClient initial={await getContent()} />;
}
