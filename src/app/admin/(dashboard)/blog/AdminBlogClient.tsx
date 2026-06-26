"use client";

import { AdminField, SaveBar, useAdminContent } from "@/components/admin/AdminForms";
import type { BlogPost, SiteContent } from "@/lib/types";

export default function AdminBlogClient({ initial }: { initial: SiteContent }) {
  const { content, setContent, save, saving, message } = useAdminContent(initial);

  function updatePost(index: number, field: keyof BlogPost, value: string | boolean) {
    const blog = [...content.blog];
    blog[index] = { ...blog[index], [field]: value };
    setContent({ ...content, blog });
  }

  function addPost() {
    const post: BlogPost = {
      id: `post-${Date.now()}`,
      title: "Nuevo artículo",
      excerpt: "Resumen del artículo",
      date: new Date().toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" }),
      category: "Marca",
      image: "/images/brand/mood.png",
      published: false,
    };
    setContent({ ...content, blog: [...content.blog, post] });
  }

  return (
    <div className="space-y-8 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl text-blue-deep">Blog</h1>
        <button type="button" onClick={addPost} className="rounded-full bg-sage px-6 py-2.5 text-sm font-bold text-blue-deep">
          + Artículo
        </button>
      </div>
      {content.blog.map((post, index) => (
        <div key={post.id} className="space-y-4 rounded-[1.5rem_2.5rem_1.5rem_2.5rem] border border-blue-deep/8 bg-white p-8">
          <AdminField label="Título" value={post.title} onChange={(v) => updatePost(index, "title", v)} />
          <AdminField label="Extracto" value={post.excerpt} onChange={(v) => updatePost(index, "excerpt", v)} multiline />
          <div className="grid gap-4 md:grid-cols-2">
            <AdminField label="Categoría" value={post.category} onChange={(v) => updatePost(index, "category", v)} />
            <AdminField label="Fecha" value={post.date} onChange={(v) => updatePost(index, "date", v)} />
            <AdminField label="Imagen (ruta)" value={post.image} onChange={(v) => updatePost(index, "image", v)} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={post.published} onChange={(e) => updatePost(index, "published", e.target.checked)} />
            Publicado
          </label>
        </div>
      ))}
      <SaveBar saving={saving} message={message} onSave={() => void save(content)} />
    </div>
  );
}
