"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ShareButton from "./ShareButton";

type Post = {
  id: number;
  book_title: string;
  book_author?: string | null;
  created_at?: string | null;
  reading_status?: "read" | "reading" | "want_to_read" | null;
};

export default function PostDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function fetchPost() {
      try {
        const res = await fetch(`/api/posts/${id}`, {
          credentials: "include",
        });
        
        if (!res.ok) {
          router.push("/");
          return;
        }

        const data = await res.json();
        setPost(data);
      } catch (err) {
        console.error(err);
        router.push("/");
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [id, router]);

  const handleStatusChange = async (newStatus: "read" | "reading" | "want_to_read") => {
    if (!post || updating) return;

    setUpdating(true);
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          book_title: post.book_title,
          book_author: post.book_author,
          reading_status: newStatus,
        }),
      });

      if (res.ok) {
        setPost({ ...post, reading_status: newStatus });
      } else {
        alert("ステータスの変更に失敗しました");
      }
    } catch (err) {
      console.error(err);
      alert("ステータスの変更に失敗しました");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-amber-50 dark:bg-amber-950 p-6 md:p-8">
        <div className="max-w-3xl mx-auto flex items-center justify-center py-20">
          <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </main>
    );
  }

  if (!post) {
    return null;
  }

  const currentStatus = post.reading_status || "read";

  return (
    <main className="min-h-screen bg-amber-50 dark:bg-amber-950 p-6 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <a href="/" className="inline-flex items-center text-amber-800 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 transition-colors mb-6 font-medium">
            <span className="mr-2">←</span> 戻る
          </a>
        </div>

        <div className="bg-white dark:bg-amber-900 border-2 border-amber-300 dark:border-amber-700 rounded-xl p-8 shadow-lg">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-amber-950 dark:text-amber-50 mb-4">{post.book_title}</h1>
          
          {post.book_author && (
            <p className="text-lg text-amber-800 dark:text-amber-200 mb-6 flex items-center gap-2">
              <span>✒️</span>
              <span>{post.book_author}</span>
            </p>
          )}

          {/* 現在のステータス表示 */}
          <div className="mb-6">
            {currentStatus === "read" && (
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded-full font-medium">
                📚 読んだ
              </span>
            )}
            {currentStatus === "reading" && (
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full font-medium">
                📖 読書中
              </span>
            )}
            {currentStatus === "want_to_read" && (
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full font-medium">
                ⭐ 読みたい
              </span>
            )}
          </div>

          {/* ステータス変更ボタン */}
          {currentStatus === "reading" && (
            <div className="mb-6 p-4 bg-amber-100 dark:bg-amber-800/30 rounded-lg border-2 border-amber-300 dark:border-amber-700">
              <p className="text-sm text-amber-900 dark:text-amber-200 mb-3 font-medium">📖 読書中 → 📚 読んだ</p>
              <button
                onClick={() => handleStatusChange("read")}
                disabled={updating}
                className="w-full px-4 py-2.5 bg-amber-700 hover:bg-amber-800 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg"
              >
                {updating ? "変更中..." : "「読んだ」に移動"}
              </button>
            </div>
          )}

          {currentStatus === "want_to_read" && (
            <div className="mb-6 p-4 bg-amber-100 dark:bg-amber-800/30 rounded-lg border-2 border-amber-300 dark:border-amber-700 space-y-3">
              <p className="text-sm text-amber-900 dark:text-amber-200 font-medium">⭐ 読みたい → ステータス変更</p>
              <button
                onClick={() => handleStatusChange("reading")}
                disabled={updating}
                className="w-full px-4 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg"
              >
                {updating ? "変更中..." : "「読書中」に移動"}
              </button>
              <button
                onClick={() => handleStatusChange("read")}
                disabled={updating}
                className="w-full px-4 py-2.5 bg-amber-700 hover:bg-amber-800 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg"
              >
                {updating ? "変更中..." : "「読んだ」に移動"}
              </button>
            </div>
          )}
          
          {post.created_at && (
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-8">
              記録日: {new Date(post.created_at).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          )}
          
          <div className="mt-8 pt-6 border-t border-amber-200 dark:border-amber-800">
            <ShareButton 
              bookTitle={post.book_title} 
              bookAuthor={post.book_author} 
              postId={post.id} 
            />
          </div>
          
          <div className="flex gap-3 mt-6">
            <Link href={`/post/${post.id}/edit`} className="flex-1 px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white font-medium rounded-lg transition-colors shadow-md text-center">
              ✏️ 編集
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
