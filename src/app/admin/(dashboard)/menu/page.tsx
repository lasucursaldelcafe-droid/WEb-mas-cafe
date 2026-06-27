import { getContent } from "@/lib/store";
import AdminMenuClient from "./AdminMenuClient";

export default async function AdminMenuPage() {
  return <AdminMenuClient initial={await getContent()} />;
}
