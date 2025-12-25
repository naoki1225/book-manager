"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function PostPage() {
  const [bookTitle, setBookTitle] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");
  const [readingStatus, setReadingStatus] = useState<"read" | "reading" | "want_to_read">("read");
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
        credentials: "include",
        body: JSON.stringify({ bookTitle, bookAuthor, readingStatus }),
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
    <main className="min-h-screen bg-amber-50 dark:bg-amber-950 p-6 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-amber-900 dark:text-amber-100 mb-2">新しい投稿</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-amber-900 border-2 border-amber-300 dark:border-amber-700 rounded-xl p-8 shadow-lg">
          <div className="mb-6">
            <label className="block text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">
              📚 書名
            </label>
            <input
              value={bookTitle}
              onChange={(e) => setBookTitle(e.target.value)}
              required
              className="w-full px-4 py-2 border-2 border-amber-300 dark:border-amber-700 rounded-lg bg-amber-50 dark:bg-amber-800 text-amber-950 dark:text-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-600 transition-colors"
              placeholder="例: 1Q84"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">
              ✒️ 著者
            </label>
            <input
              value={bookAuthor}
              onChange={(e) => setBookAuthor(e.target.value)}
              className="w-full px-4 py-2 border-2 border-amber-300 dark:border-amber-700 rounded-lg bg-amber-50 dark:bg-amber-800 text-amber-950 dark:text-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-600 transition-colors"
              placeholder="例: 村上春樹"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">
              📚 本棚
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setReadingStatus("read")}
                className={`px-4 py-3 rounded-lg font-semibold transition-all shadow-sm ${
                  readingStatus === "read"
                    ? "bg-amber-700 text-white shadow-lg scale-105"
                    : "bg-white dark:bg-amber-800 text-amber-900 dark:text-amber-100 border-2 border-amber-300 dark:border-amber-700 hover:border-amber-500"
                }`}
              >
                📚 読んだ
              </button>
              <button
                type="button"
                onClick={() => setReadingStatus("reading")}
                className={`px-4 py-3 rounded-lg font-semibold transition-all shadow-sm ${
                  readingStatus === "reading"
                    ? "bg-amber-600 text-white shadow-lg scale-105"
                    : "bg-white dark:bg-amber-800 text-amber-900 dark:text-amber-100 border-2 border-amber-300 dark:border-amber-700 hover:border-amber-500"
                }`}
              >
                📖 読書中
              </button>
              <button
                type="button"
                onClick={() => setReadingStatus("want_to_read")}
                className={`px-4 py-3 rounded-lg font-semibold transition-all shadow-sm ${
                  readingStatus === "want_to_read"
                    ? "bg-amber-800 text-white shadow-lg scale-105"
                    : "bg-white dark:bg-amber-800 text-amber-900 dark:text-amber-100 border-2 border-amber-300 dark:border-amber-700 hover:border-amber-500"
                }`}
              >
                ⭐ 読みたい
              </button>
            </div>
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
            className="w-full px-6 py-3 bg-amber-700 hover:bg-amber-800 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors shadow-md duration-200"
          >
            {loading ? "送信中..." : "投稿する"}
          </button>
        </form>
      </div>
    </main>
  );
}
