"use client";

import { useEffect, useState } from "react";

type Post = {
  id: number;
  book_title: string;
  book_author?: string | null;
  quote?: string | null;
  created_at?: string | null;
};

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("/api/posts");

        if (!res.ok) {
          throw new Error(`fetch failed: ${res.status}`);
        }

        const data = await res.json();
        setPosts(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error(err);
        setError(err?.message ?? "failed to fetch posts");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <main style={{ padding: 20 }}>
      <h1>ホンキ録</h1>

      {loading ? (
        <p>読み込み中...</p>
      ) : error ? (
        <p style={{ color: "red" }}>エラー: {error}</p>
      ) : posts.length === 0 ? (
        <p>投稿がありません。</p>
      ) : (
        <ul>
          {posts.map((post) => (
            <li key={post.id} style={{ marginBottom: 12 }}>
              <strong>{post.book_title}</strong>
              {post.book_author ? <div>著者: {post.book_author}</div> : null}
              {post.quote ? <blockquote style={{ margin: "6px 0" }}>{post.quote}</blockquote> : null}
              {post.created_at ? (
                <div style={{ fontSize: 12, color: "#666" }}>{new Date(post.created_at).toLocaleString()}</div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
