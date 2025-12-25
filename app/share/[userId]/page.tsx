"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";

type Post = {
  id: number;
  book_title: string;
  book_author?: string | null;
  created_at?: string | null;
  reading_status?: "read" | "reading" | "want_to_read" | null;
};

type ShareData = {
  posts: Post[];
};

function BookCover({ title, author }: { title: string; author?: string | null }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchCover() {
      try {
        const qTitle = encodeURIComponent(title || "");
        const qAuthor = author ? `&author=${encodeURIComponent(author)}` : "";
        const res = await fetch(`https://openlibrary.org/search.json?title=${qTitle}${qAuthor}&limit=1`);
        if (!res.ok) return;
        const data = await res.json();
        const doc = data?.docs?.[0];
        if (!mounted) return;

        if (doc?.cover_i) {
          setSrc(`https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`);
          return;
        }

        try {
          const gqTitle = encodeURIComponent(title || "");
          const gqAuthor = author ? `+inauthor:${encodeURIComponent(author)}` : "";
          const gres = await fetch(`https://www.googleapis.com/books/v1/volumes?q=intitle:${gqTitle}${gqAuthor}&maxResults=1`);
          if (gres.ok) {
            const gdata = await gres.json();
            const thumb = gdata?.items?.[0]?.volumeInfo?.imageLinks?.thumbnail;
            if (thumb) {
              setSrc(thumb.replace(/^http:/, "https:"));
              return;
            }
          }
        } catch (e) {
          // ignore
        }

        setSrc(null);
      } catch (e) {
        setSrc(null);
      }
    }

    fetchCover();
    return () => { mounted = false; };
  }, [title, author]);

  return src ? (
    <img
      src={src}
      onError={() => setSrc(null)}
      alt={`${title} 表紙`}
      className="w-12 h-18 object-cover rounded shadow-sm"
    />
  ) : (
    <div className="w-12 h-18 bg-slate-300 dark:bg-slate-600 rounded shadow-sm flex items-center justify-center">
      <span className="text-xs text-slate-500">📚</span>
    </div>
  );
}

export default function SharePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const userId = params?.userId as string;
  const nickname = searchParams?.get("nickname") || "匿名ユーザー";
  const [data, setData] = useState<ShareData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "read" | "reading" | "want_to_read">("all");

  useEffect(() => {
    if (!userId) return;

    async function fetchData() {
      try {
        const res = await fetch(`/api/share/${userId}`);
        if (!res.ok) throw new Error("データの取得に失敗しました");
        const result = await res.json();
        
        // ソート: 作者 → 題名
        const sorted = (result.posts || []).sort((a: Post, b: Post) => {
          const authorA = (a.book_author || "").toLowerCase();
          const authorB = (b.book_author || "").toLowerCase();
          if (authorA < authorB) return -1;
          if (authorA > authorB) return 1;
          const titleA = (a.book_title || "").toLowerCase();
          const titleB = (b.book_title || "").toLowerCase();
          return titleA < titleB ? -1 : titleA > titleB ? 1 : 0;
        });
        
        setData({ posts: sorted });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [userId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-amber-50 dark:bg-amber-950 p-4 md:p-8">
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-amber-700 dark:text-amber-300 font-medium">読み込み中...</p>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-amber-50 dark:bg-amber-950 p-4 md:p-8">
        <div className="max-w-4xl mx-auto text-center py-20">
          <div className="text-6xl mb-6">⚠️</div>
          <p className="text-xl text-amber-800 dark:text-amber-300 mb-4 font-medium">読書リストが見つかりません</p>
          <p className="text-sm text-amber-600 dark:text-amber-400">{error}</p>
        </div>
      </main>
    );
  }

  const filteredPosts = filterStatus === "all" 
    ? data.posts 
    : data.posts.filter(post => post.reading_status === filterStatus);

  const readCount = data.posts.filter(p => p.reading_status === "read").length;
  const readingCount = data.posts.filter(p => p.reading_status === "reading").length;
  const wantCount = data.posts.filter(p => p.reading_status === "want_to_read").length;

  return (
    <main className="min-h-screen bg-amber-50 dark:bg-amber-950 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-amber-900 dark:text-amber-100 mb-3 tracking-tight">
            {nickname}の読書録
          </h1>
          <p className="text-amber-700 dark:text-amber-300 text-sm md:text-base mb-6">
            全{data.posts.length}冊の本を記録しています
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-semibold transition-colors shadow-md"
          >
            <span>✍️</span>
            <span>自分の読書録を作る</span>
          </Link>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-white dark:bg-amber-900 border-2 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-100 rounded-xl p-4 shadow-lg">
            <div className="text-3xl font-bold mb-1">{readCount}</div>
            <div className="text-sm">📚 読んだ</div>
          </div>
          <div className="bg-white dark:bg-amber-900 border-2 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-100 rounded-xl p-4 shadow-lg">
            <div className="text-3xl font-bold mb-1">{readingCount}</div>
            <div className="text-sm">📖 読書中</div>
          </div>
          <div className="bg-white dark:bg-amber-900 border-2 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-100 rounded-xl p-4 shadow-lg">
            <div className="text-3xl font-bold mb-1">{wantCount}</div>
            <div className="text-sm">⭐ 読みたい</div>
          </div>
        </div>

        {/* 本棚フィルター */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm shadow-sm ${
                filterStatus === "all"
                  ? "bg-amber-700 text-white shadow-lg scale-105"
                  : "bg-white dark:bg-amber-900 text-amber-900 dark:text-amber-100 border-2 border-amber-300 dark:border-amber-700"
              }`}
            >
              📚 すべて
            </button>
            <button
              onClick={() => setFilterStatus("read")}
              className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm shadow-sm ${
                filterStatus === "read"
                  ? "bg-amber-700 text-white shadow-lg scale-105"
                  : "bg-white dark:bg-amber-900 text-amber-900 dark:text-amber-100 border-2 border-amber-300 dark:border-amber-700"
              }`}
            >
              📚 読んだ
            </button>
            <button
              onClick={() => setFilterStatus("reading")}
              className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm shadow-sm ${
                filterStatus === "reading"
                  ? "bg-amber-600 text-white shadow-lg scale-105"
                  : "bg-white dark:bg-amber-900 text-amber-900 dark:text-amber-100 border-2 border-amber-300 dark:border-amber-700"
              }`}
            >
              📖 読書中
            </button>
            <button
              onClick={() => setFilterStatus("want_to_read")}
              className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm shadow-sm ${
                filterStatus === "want_to_read"
                  ? "bg-amber-800 text-white shadow-lg scale-105"
                  : "bg-white dark:bg-amber-900 text-amber-900 dark:text-amber-100 border-2 border-amber-300 dark:border-amber-700"
              }`}
            >
              ⭐ 読みたい
            </button>
          </div>
        </div>

        {/* 本のリスト */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">📚</div>
            <p className="text-xl text-amber-800 dark:text-amber-300 mb-4 font-medium">この本棚に本がありません</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPosts.map((post) => (
              <div 
                key={post.id} 
                className="bg-white dark:bg-amber-900 border-2 border-amber-300 dark:border-amber-700 rounded-xl p-4 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0">
                    <BookCover title={post.book_title} author={post.book_author} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-amber-900 dark:text-amber-100 mb-1 line-clamp-2">
                      {post.book_title}
                    </h3>
                    {post.book_author && (
                      <p className="text-sm text-amber-700 dark:text-amber-300 mb-2 flex items-center gap-1">
                        <span>✒️</span>
                        <span>{post.book_author}</span>
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      {post.reading_status === "read" && (
                        <span className="text-xs px-2 py-1 bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 rounded-full font-medium">
                          📚 読んだ
                        </span>
                      )}
                      {post.reading_status === "reading" && (
                        <span className="text-xs px-2 py-1 bg-amber-300 dark:bg-amber-700 text-amber-900 dark:text-amber-100 rounded-full font-medium">
                          📖 読書中
                        </span>
                      )}
                      {post.reading_status === "want_to_read" && (
                        <span className="text-xs px-2 py-1 bg-amber-400 dark:bg-amber-600 text-amber-900 dark:text-amber-100 rounded-full font-medium">
                          ⭐ 読みたい
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
