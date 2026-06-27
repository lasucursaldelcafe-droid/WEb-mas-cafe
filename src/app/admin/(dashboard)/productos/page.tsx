import { getContent } from "@/lib/store";
import AdminProductosClient from "./AdminProductosClient";

export default async function AdminProductosPage() {
  const content = await getContent();
  return <AdminProductosClient initial={content} />;
}
