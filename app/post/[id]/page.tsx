import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";

export default async function PostDetail({ params }: { params: { id: string } | Promise<{ id: string }> }) {
  const { id: idParam } = (await params) as { id: string };
  const id = idParam;
  if (!id) return notFound();

  const { data, error } = await supabase.from("posts").select("*").eq("id", id).single();

  if (error || !data) return notFound();

  return (
    <main style={{ padding: 20 }}>
      <h1>{data.book_title}</h1>
      {data.book_author ? <div>著者: {data.book_author}</div> : null}
      {data.quote ? <blockquote style={{ margin: "12px 0" }}>{data.quote}</blockquote> : null}
      {data.created_at ? <div style={{ fontSize: 12, color: "#666" }}>{new Date(data.created_at).toLocaleString()}</div> : null}

    </main>
  );
}
