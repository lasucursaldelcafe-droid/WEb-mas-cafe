import { getContent } from "@/lib/store";
import AdminBlogClient from "./AdminBlogClient";

export default async function AdminBlogPage() {
  return <AdminBlogClient initial={await getContent()} />;
}
