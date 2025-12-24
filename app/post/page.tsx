"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function PostPage() {
  const [bookTitle, setBookTitle] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");
  const [quote, setQuote] = useState("");
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
        body: JSON.stringify({ bookTitle, bookAuthor, quote }),
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
    <main style={{ padding: 20 }}>
      <h1>新しい投稿</h1>

      <form onSubmit={handleSubmit} style={{ maxWidth: 600 }}>
        <div style={{ marginBottom: 12 }}>
          <label>
            書名
            <input
              value={bookTitle}
              onChange={(e) => setBookTitle(e.target.value)}
              required
              style={{ display: "block", width: "100%", padding: 8 }}
            />
          </label>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>
            著者
            <input
              value={bookAuthor}
              onChange={(e) => setBookAuthor(e.target.value)}
              style={{ display: "block", width: "100%", padding: 8 }}
            />
          </label>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>
            引用
            <textarea
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              rows={4}
              style={{ display: "block", width: "100%", padding: 8 }}
            />
          </label>
        </div>

        {error ? <div style={{ color: "red", marginBottom: 8 }}>{error}</div> : null}

        <button type="submit" disabled={loading} style={{ padding: "8px 12px" }}>
          {loading ? "送信中..." : "投稿する"}
        </button>
      </form>
    </main>
  );
}
