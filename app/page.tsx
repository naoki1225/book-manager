"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Post = {
  id: number;
  book_title: string;
  book_author?: string | null;
  quote?: string | null;
  created_at?: string | null;
};

function BookCover({ title, author }: { title: string; author?: string | null }) {
  const [src, setSrc] = useState<string | null>(null);
  const [href, setHref] = useState<string | null>(null);

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
            // prefer work or edition link if available
            if (doc.key) setHref(`https://openlibrary.org${doc.key}`);
            else if (doc.cover_edition_key) setHref(`https://openlibrary.org/books/${doc.cover_edition_key}`);
            return;
          }

          if (doc.isbn && doc.isbn.length) {
            setSrc(`https://covers.openlibrary.org/b/isbn/${doc.isbn[0]}-M.jpg`);
            setHref(`https://openlibrary.org/isbn/${doc.isbn[0]}`);
            return;
          }
          if (doc.key) {
            setHref(`https://openlibrary.org${doc.key}`);
          }
        }

        // OpenLibrary didn't provide a cover image; try Google Books as a fallback
        try {
          const gqTitle = encodeURIComponent(title || "");
          const gqAuthor = author ? `+inauthor:${encodeURIComponent(author)}` : "";
          const gres = await fetch(`https://www.googleapis.com/books/v1/volumes?q=intitle:${gqTitle}${gqAuthor}&maxResults=1`);
          if (gres.ok) {
            const gdata = await gres.json();
            const item = gdata?.items?.[0];
            const thumb = item?.volumeInfo?.imageLinks?.thumbnail || item?.volumeInfo?.imageLinks?.smallThumbnail;
            const info = item?.volumeInfo?.infoLink || item?.volumeInfo?.canonicalVolumeLink || item?.volumeInfo?.previewLink;
            if (thumb) {
              const secure = thumb.startsWith("http:") ? thumb.replace(/^http:/, "https:") : thumb;
              setSrc(secure);
              if (info) setHref(info.startsWith("http:") ? info.replace(/^http:/, "https:") : info);
              return;
            }
            if (info) {
              setHref(info.startsWith("http:") ? info.replace(/^http:/, "https:") : info);
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
      style={{ width: 48, height: 72, objectFit: "cover", marginRight: 12 }}
    />
  ) : (
    <div style={{ width: 48, height: 72, background: "#eee", marginRight: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#666" }}>
      表紙なし
    </div>
  );

  const handleImageClick = (e: React.MouseEvent) => {
    if (href) {
      e.preventDefault();
      e.stopPropagation();
      window.open(href, "_blank");
    }
  };

  return (
    <div
      onClick={handleImageClick}
      role={href ? "button" : undefined}
      tabIndex={href ? 0 : undefined}
      onKeyDown={href ? (e) => e.key === "Enter" && handleImageClick(e as any) : undefined}
      style={{
        display: "inline-block",
        cursor: href ? "pointer" : "default",
      }}
    >
      {content}
    </div>
  );
}

export default function Home() {
  const router = useRouter();
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
      
      <div style={{ margin: "12px 0" }}>
        <button onClick={() => router.push('/post')} style={{ padding: "8px 12px", cursor: "pointer" }}>新規登録</button>
      </div>
      {loading ? (
        <p>読み込み中...</p>
      ) : error ? (
        <p style={{ color: "red" }}>エラー: {error}</p>
      ) : posts.length === 0 ? (
        <p>投稿がありません。</p>
      ) : (
        <ul>
          {posts.map((post) => (
            <li key={post.id} style={{ marginBottom: 12, display: "flex", alignItems: "flex-start" }}>
              <Link href={`/post/${post.id}`} style={{ display: "flex", alignItems: "flex-start", textDecoration: "none", color: "inherit" }}>
                <BookCover title={post.book_title} author={post.book_author} />
                <div>
                  <strong>{post.book_title}</strong>
                  {post.book_author ? <div>著者: {post.book_author}</div> : null}
                  {post.quote ? <blockquote style={{ margin: "6px 0" }}>{post.quote}</blockquote> : null}
                  {post.created_at ? (
                    <div style={{ fontSize: 12, color: "#666" }}>{new Date(post.created_at).toLocaleString()}</div>
                  ) : null}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
