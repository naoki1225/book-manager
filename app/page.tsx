"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../lib/supabase";
import ShareListButton from "./components/ShareListButton";

type Post = {
  id: number;
  book_title: string;
  book_author?: string | null;
  created_at?: string | null;
  reading_status?: "read" | "reading" | "want_to_read" | null;
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

        if (doc) {
          if (doc.cover_i) {
            setSrc(`https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`);
            return;
          }

          if (doc.isbn && doc.isbn.length) {
            setSrc(`https://covers.openlibrary.org/b/isbn/${doc.isbn[0]}-M.jpg`);
            return;
          }
        }

        try {
          const gqTitle = encodeURIComponent(title || "");
          const gqAuthor = author ? `+inauthor:${encodeURIComponent(author)}` : "";
          const gres = await fetch(`https://www.googleapis.com/books/v1/volumes?q=intitle:${gqTitle}${gqAuthor}&maxResults=1`);
          if (gres.ok) {
            const gdata = await gres.json();
            const item = gdata?.items?.[0];
            const thumb = item?.volumeInfo?.imageLinks?.thumbnail || item?.volumeInfo?.imageLinks?.smallThumbnail;
            if (thumb) {
              const secure = thumb.startsWith("http:") ? thumb.replace(/^http:/, "https:") : thumb;
              setSrc(secure);
              return;
            }
          }
        } catch (e) {
          // ignore google fallback errors
        }

        setSrc(null);
      } catch (e) {
        setSrc(null);
      }
    }

    fetchCover();
    return () => {
      mounted = false;
    };
  }, [title, author]);

  const content = src ? (
    <img
      src={src}
      onError={() => setSrc(null)}
      alt={`${title} 表紙`}
      className="w-16 h-24 object-cover rounded shadow-md"
    />
  ) : (
    <div className="w-16 h-24 bg-slate-300 dark:bg-slate-600 rounded shadow-md flex items-center justify-center">
      <span className="text-xs text-slate-600 dark:text-slate-400">表紙なし</span>
    </div>
  );

  return <div className="inline-block flex-shrink-0">{content}</div>;
}

function BookTitleLink({ title, author }: { title: string; author?: string | null }) {
  const [href, setHref] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchLink() {
      try {
        const qTitle = encodeURIComponent(title || "");
        const qAuthor = author ? `&author=${encodeURIComponent(author)}` : "";
        const res = await fetch(`https://openlibrary.org/search.json?title=${qTitle}${qAuthor}&limit=1`);
        if (!res.ok) return;
        const data = await res.json();
        const doc = data?.docs?.[0];
        if (!mounted) return;

        if (doc) {
          if (doc.key) {
            setHref(`https://openlibrary.org${doc.key}`);
            return;
          }
          if (doc.isbn && doc.isbn.length) {
            setHref(`https://openlibrary.org/isbn/${doc.isbn[0]}`);
            return;
          }
        }

        try {
          const gqTitle = encodeURIComponent(title || "");
          const gqAuthor = author ? `+inauthor:${encodeURIComponent(author)}` : "";
          const gres = await fetch(`https://www.googleapis.com/books/v1/volumes?q=intitle:${gqTitle}${gqAuthor}&maxResults=1`);
          if (gres.ok) {
            const gdata = await gres.json();
            const item = gdata?.items?.[0];
            const info = item?.volumeInfo?.infoLink || item?.volumeInfo?.canonicalVolumeLink || item?.volumeInfo?.previewLink;
            if (info) {
              setHref(info.startsWith("http:") ? info.replace(/^http:/, "https:") : info);
            }
          }
        } catch (e) {
          // ignore google fallback errors
        }
      } catch (e) {
        // ignore errors
      }
    }

    fetchLink();
    return () => {
      mounted = false;
    };
  }, [title, author]);

  if (!href) {
    return <h3 className="text-sm font-bold text-amber-950 dark:text-amber-100 line-clamp-2">{title}</h3>;
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm font-bold text-amber-950 dark:text-amber-100 hover:text-amber-700 dark:hover:text-amber-500 transition-colors line-clamp-2 block"
    >
      {title}
    </a>
  );
}

export default function Home() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [nickname, setNickname] = useState<string>("ホンキ");
  const [filterStatus, setFilterStatus] = useState<"all" | "read" | "reading" | "want_to_read">("all");
  const [userId, setUserId] = useState<string | null>(null);
  const itemsPerPage = 20;

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (!error && user) {
          setUserId(user.id);
          if (user.user_metadata?.nickname) {
            setNickname(user.user_metadata.nickname);
          }
        }
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
      }
    };

    const fetchPosts = async () => {
      try {
        const res = await fetch("/api/posts", {
          credentials: "include",
        });

        if (res.status === 401) {
          router.push("/login");
          return;
        }

        if (!res.ok) {
          throw new Error(`fetch failed: ${res.status}`);
        }

        const data = await res.json();
        const sortedData = Array.isArray(data) 
          ? data.sort((a, b) => {
              const authorA = (a.book_author || "").toLowerCase();
              const authorB = (b.book_author || "").toLowerCase();
              if (authorA < authorB) return -1;
              if (authorA > authorB) return 1;
              const titleA = (a.book_title || "").toLowerCase();
              const titleB = (b.book_title || "").toLowerCase();
              return titleA < titleB ? -1 : titleA > titleB ? 1 : 0;
            })
          : [];
        setPosts(sortedData);
        setCurrentPage(1);
      } catch (err: any) {
        console.error(err);
        setError(err?.message ?? "failed to fetch posts");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
    fetchPosts();
  }, [router]);

  const filteredPosts = filterStatus === "all" 
    ? posts 
    : posts.filter(post => post.reading_status === filterStatus);

  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPosts = filteredPosts.slice(startIndex, endIndex);

  return (
    <main className="min-h-screen bg-amber-50 dark:bg-amber-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-10">
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-amber-900 dark:text-amber-100 mb-4 tracking-tight">
            {nickname}録
          </h1>
          <p className="text-amber-700 dark:text-amber-400 text-sm md:text-base mb-6">
            あなたの読書の軌跡を記録する場所
          </p>
          {userId && posts.length > 0 && (
            <ShareListButton 
              userId={userId} 
              nickname={nickname} 
              totalBooks={posts.length} 
            />
          )}
        </div>
        
        {/* ナビゲーション */}
        <div className="flex flex-wrap gap-3 mb-10">
          <button 
            onClick={() => router.push('/post')} 
            className="px-6 py-3 bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-700 text-white rounded-lg font-medium transition-colors shadow-md"
          >
            <span className="flex items-center gap-2">
              <span>✍️</span>
              新しい投稿
            </span>
          </button>
          <button 
            onClick={() => router.push('/stats')} 
            className="px-6 py-3 bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-700 text-white rounded-lg font-medium transition-colors shadow-md"
          >
            <span className="flex items-center gap-2">
              <span>📊</span>
              読書統計
            </span>
          </button>
          <button 
            onClick={() => router.push('/recommend')} 
            className="px-6 py-3 bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-700 text-white rounded-lg font-medium transition-colors shadow-md"
          >
            <span className="flex items-center gap-2">
              <span>✨</span>
              おすすめの本
            </span>
          </button>
        </div>

        {/* 本棚フィルター */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => { setFilterStatus("all"); setCurrentPage(1); }}
              className={`px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm ${
                filterStatus === "all"
                  ? "bg-amber-700 text-white"
                  : "bg-white dark:bg-amber-900 text-amber-900 dark:text-amber-100 border-2 border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-800"
              }`}
            >
              📚 すべて ({posts.length})
            </button>
            <button
              onClick={() => { setFilterStatus("read"); setCurrentPage(1); }}
              className={`px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm ${
                filterStatus === "read"
                  ? "bg-amber-700 text-white"
                  : "bg-white dark:bg-amber-900 text-amber-900 dark:text-amber-100 border-2 border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-800"
              }`}
            >
              📚 読んだ ({posts.filter(p => p.reading_status === "read").length})
            </button>
            <button
              onClick={() => { setFilterStatus("reading"); setCurrentPage(1); }}
              className={`px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm ${
                filterStatus === "reading"
                  ? "bg-amber-700 text-white"
                  : "bg-white dark:bg-amber-900 text-amber-900 dark:text-amber-100 border-2 border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-800"
              }`}
            >
              📖 読書中 ({posts.filter(p => p.reading_status === "reading").length})
            </button>
            <button
              onClick={() => { setFilterStatus("want_to_read"); setCurrentPage(1); }}
              className={`px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm ${
                filterStatus === "want_to_read"
                  ? "bg-amber-700 text-white"
                  : "bg-white dark:bg-amber-900 text-amber-900 dark:text-amber-100 border-2 border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-800"
              }`}
            >
              ⭐ 読みたい ({posts.filter(p => p.reading_status === "want_to_read").length})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400 font-medium">読み込み中...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-600 text-red-700 dark:text-red-400 p-6 rounded-lg">
            <p className="font-bold text-lg mb-1">⚠️ エラーが発生しました</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">📚</div>
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-4 font-medium">
              {filterStatus === "all" ? "まだ投稿がありません" : "この本棚に本がありません"}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-500 mb-8">
              {filterStatus === "all" ? "最初の本を記録してみましょう！" : "他の本棚を確認してみてください"}
            </p>
            {filterStatus === "all" && (
              <button
                onClick={() => router.push('/post')}
                className="px-8 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                ✍️ 最初の投稿を作成
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {currentPosts.map((post) => (
                <div 
                  key={post.id} 
                  className="bg-white dark:bg-amber-900 border-2 border-amber-200 dark:border-amber-700 rounded-lg p-4 hover:shadow-lg hover:border-amber-300 dark:hover:border-amber-600 transition-all"
                >
                  <div className="flex gap-3 mb-3">
                    <div className="flex-shrink-0">
                      <BookCover title={post.book_title} author={post.book_author} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="mb-1">
                        <BookTitleLink title={post.book_title} author={post.book_author} />
                      </div>
                      {post.book_author ? (
                        <p className="text-xs text-amber-700 dark:text-amber-300 flex items-center gap-1">
                          <span className="text-amber-600 dark:text-amber-400">✒️</span>
                          <span className="line-clamp-1">{post.book_author}</span>
                        </p>
                      ) : null}
                    </div>
                  </div>
                  
                  <Link 
                    href={`/post/${post.id}`} 
                    className="block w-full px-3 py-2 bg-amber-700 hover:bg-amber-800 text-white font-medium rounded-lg text-center text-xs transition-colors shadow-sm"
                  >
                    詳細 →
                  </Link>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-12">
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-5 py-2.5 bg-white dark:bg-amber-900 hover:bg-amber-100 dark:hover:bg-amber-800 disabled:opacity-50 disabled:cursor-not-allowed text-amber-900 dark:text-amber-100 rounded-lg font-medium transition-colors border-2 border-amber-300 dark:border-amber-700 shadow-sm"
                >
                  ← 前へ
                </button>
                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg font-medium transition-colors shadow-sm ${
                        currentPage === page
                          ? "bg-amber-700 text-white"
                          : "bg-white dark:bg-amber-900 text-amber-900 dark:text-amber-100 hover:bg-amber-100 dark:hover:bg-amber-800 border-2 border-amber-300 dark:border-amber-700"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-5 py-2.5 bg-white dark:bg-amber-900 hover:bg-amber-100 dark:hover:bg-amber-800 disabled:opacity-50 disabled:cursor-not-allowed text-amber-900 dark:text-amber-100 rounded-lg font-medium transition-colors border-2 border-amber-300 dark:border-amber-700 shadow-sm"
                >
                  次へ →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
