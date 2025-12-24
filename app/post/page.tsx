"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function PostPage() {
  const [bookTitle, setBookTitle] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookTitle, bookAuthor }),
      });

      if (!res.ok) throw new Error(`failed: ${res.status}`);

      router.push("/");
    } catch (err: any) {
      setError(err?.message ?? "投稿に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen  dark:from-slate-950 dark:to-slate-900 p-6 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-amber-950 dark:text-amber-100 mb-2">新しい投稿</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-8 shadow-sm">
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              書名
            </label>
            <input
              value={bookTitle}
              onChange={(e) => setBookTitle(e.target.value)}
              required
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-amber-950 dark:text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-700 transition-colors"
              placeholder="例: 1Q84"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              著者
            </label>
            <input
              value={bookAuthor}
              onChange={(e) => setBookAuthor(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-amber-950 dark:text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-700 transition-colors"
              placeholder="例: 村上春樹"
            />
          </div>

          {/* 引用フィールドは非表示 */}

          {error ? (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          ) : null}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full px-6 py-3 bg-amber-900 hover:bg-amber-950 hover:bg-amber-800 disabled:bg-slate-400 text-white font-medium rounded-lg transition-colors duration-200"
          >
            {loading ? "送信中..." : "投稿する"}
          </button>
        </form>
      </div>
    </main>
  );
}
