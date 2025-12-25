"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Post = {
  id: string;
  book_title: string;
  book_author?: string | null;
};

export default function EditPostPage({ params }: { params: { id: string } | Promise<{ id: string }> }) {
  const router = useRouter();
  const [id, setId] = useState<string>("");
  const [bookTitle, setBookTitle] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadPost = async () => {
      try {
        const resolvedParams = (await params) as { id: string };
        setId(resolvedParams.id);

        const { data, error: fetchError } = await supabase
          .from("posts")
          .select("*")
          .eq("id", resolvedParams.id)
          .single();

        if (fetchError || !data) {
          throw new Error("投稿が見つかりません");
        }

        setBookTitle(data.book_title || "");
        setBookAuthor(data.book_author || "");
      } catch (err: any) {
        setError(err?.message ?? "投稿の読み込みに失敗しました");
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [params]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ book_title: bookTitle, book_author: bookAuthor }),
      });

      if (!res.ok) throw new Error(`failed: ${res.status}`);

      router.push(`/post/${id}`);
    } catch (err: any) {
      setError(err?.message ?? "更新に失敗しました");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-amber-50 dark:bg-amber-950 p-6 md:p-8">
        <div className="max-w-2xl mx-auto">
          <p className="text-amber-700 dark:text-amber-300">読み込み中...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-amber-50 dark:bg-amber-950 p-6 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <a href={`/post/${id}`} className="inline-flex items-center text-amber-800 dark:text-amber-300 hover:text-amber-600 dark:hover:text-amber-200 transition-colors mb-6 font-medium">
            <span className="mr-2">←</span> 戻る
          </a>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-amber-900 dark:text-amber-100 mb-2">投稿を編集</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-amber-900 border-2 border-amber-300 dark:border-amber-700 rounded-xl p-8 shadow-lg">
          <div className="mb-6">
            <label className="block text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">
              書名
            </label>
            <input
              value={bookTitle}
              onChange={(e) => setBookTitle(e.target.value)}
              required
              className="w-full px-4 py-2 border border-amber-200 dark:border-amber-700 rounded-lg bg-white dark:bg-amber-900 text-amber-950 dark:text-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-700 transition-colors"
              placeholder="例: 1Q84"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">
              著者
            </label>
            <input
              value={bookAuthor}
              onChange={(e) => setBookAuthor(e.target.value)}
              className="w-full px-4 py-2 border border-amber-200 dark:border-amber-700 rounded-lg bg-white dark:bg-amber-900 text-amber-950 dark:text-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-700 transition-colors"
              placeholder="例: 村上春樹"
            />
          </div>

          {error ? (
            <div className="bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 p-3 rounded-lg mb-6 text-sm border-2 border-red-300 dark:border-red-700">
              {error}
            </div>
          ) : null}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 px-6 py-3 bg-amber-700 hover:bg-amber-800 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors shadow-md duration-200"
            >
              {isSaving ? "更新中..." : "更新する"}
            </button>
            <button
              type="button"
              onClick={() => router.push(`/post/${id}`)}
              className="flex-1 px-6 py-3 bg-amber-200 dark:bg-amber-800 hover:bg-amber-300 dark:hover:bg-amber-700 text-amber-900 dark:text-amber-100 font-medium rounded-lg transition-colors shadow-md duration-200"
            >
              キャンセル
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
