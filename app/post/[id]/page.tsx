import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function PostDetail({ params }: { params: { id: string } | Promise<{ id: string }> }) {
  const { id: idParam } = (await params) as { id: string };
  const id = idParam;
  if (!id) return notFound();

  const { data, error } = await supabase.from("posts").select("*").eq("id", id).single();

  if (error || !data) return notFound();

  return (
    <main className="min-h-screen bg-amber-50 dark:bg-amber-950 p-6 md:p-8">
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
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-8">
              記録日: {new Date(data.created_at).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          ) : null}
          
          <div className="flex gap-3 mt-8 pt-6 border-t border-amber-200 dark:border-amber-800">
            <Link href={`/post/${data.id}/edit`} className="flex-1 px-4 py-2 bg-amber-900 hover:bg-amber-950 text-white font-medium rounded-lg transition-colors text-center">
              編集
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
