"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Post = {
  id: number;
  book_title: string;
  book_author?: string | null;
  created_at?: string | null;
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
    return <h2 className="text-lg font-semibold text-amber-950 dark:text-amber-100">{title}</h2>;
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-lg font-semibold text-amber-950 dark:text-amber-100 hover:text-amber-700 dark:hover:text-amber-500 transition-colors"
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
  const itemsPerPage = 20;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("/api/posts");

        if (!res.ok) {
          throw new Error(`fetch failed: ${res.status}`);
        }

        const data = await res.json();
        setPosts(Array.isArray(data) ? data : []);
        setCurrentPage(1);
      } catch (err: any) {
        console.error(err);
        setError(err?.message ?? "failed to fetch posts");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const totalPages = Math.ceil(posts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPosts = posts.slice(startIndex, endIndex);

  return (
    <main className="min-h-screen dark:from-slate-950 dark:to-slate-900 p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-amber-950 dark:text-amber-100 mb-2">ホンキ録</h1>
        </div>
        
        <button 
          onClick={() => router.push('/post')} 
          className="mb-8 px-6 py-2 bg-amber-900 hover:bg-amber-950 hover:bg-amber-800 text-white rounded-lg font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
        >
          新しい投稿を作成
        </button>

        {loading ? (
          <div className="flex justify-center py-12">
            <p className="text-slate-500 dark:text-slate-400">読み込み中...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-lg mb-6">
            エラー: {error}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500 dark:text-slate-400">投稿がありません</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentPosts.map((post) => (
                <div key={post.id} className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex gap-4">
                  <div className="flex-shrink-0">
                    <BookCover title={post.book_title} author={post.book_author} />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <BookTitleLink title={post.book_title} author={post.book_author} />
                      {post.book_author ? <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">著者: {post.book_author}</p> : null}
                    </div>
                    {post.created_at ? (
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">{new Date(post.created_at).toLocaleDateString('ja-JP')}</p>
                    ) : null}
                    
                    <div className="flex gap-3 mt-4 pt-3">
                      <Link href={`/post/${post.id}`} className="flex-1 px-3 py-1 bg-amber-900 hover:bg-amber-950 text-white font-medium rounded text-center text-sm transition-colors">
                        詳細
                      </Link>
                    </div>

                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-amber-900 hover:bg-amber-950 hover:bg-amber-800 disabled:bg-slate-400 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  前へ
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-lg font-medium transition-colors duration-200 ${
                        currentPage === page
                          ? "bg-amber-900 hover:bg-amber-950 text-white"
                          : "bg-slate-200 dark:bg-slate-700 text-amber-950 dark:text-amber-100 hover:bg-slate-300 dark:hover:bg-slate-600"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-amber-900 hover:bg-amber-950 hover:bg-amber-800 disabled:bg-slate-400 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  次へ
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
