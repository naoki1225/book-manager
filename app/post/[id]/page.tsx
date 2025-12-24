import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";

export default async function PostDetail({ params }: { params: { id: string } | Promise<{ id: string }> }) {
  const { id: idParam } = (await params) as { id: string };
  const id = idParam;
  if (!id) return notFound();

  const { data, error } = await supabase.from("posts").select("*").eq("id", id).single();

  if (error || !data) return notFound();

  return (
    <main className="min-h-screen  dark:from-slate-950 dark:to-slate-900 p-6 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <a href="/" className="inline-flex items-center text-amber-700 dark:text-amber-500 hover:opacity-70 mb-6">
            <span className="mr-2">←</span> 戻る
          </a>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-8 shadow-sm">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-amber-950 dark:text-amber-100 mb-4">{data.book_title}</h1>
          
          {data.book_author ? (
            <p className="text-lg text-amber-800 dark:text-amber-200 mb-6">著者: {data.book_author}</p>
          ) : null}
          
          {data.created_at ? (
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-8">
              記録日: {new Date(data.created_at).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          ) : null}
        </div>
      </div>
    </main>
  );
}
