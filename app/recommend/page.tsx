"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

type Post = {
  id: number;
  book_title: string;
  book_author?: string | null;
  created_at?: string | null;
};

type RecommendedBook = {
  title: string;
  author: string;
  description: string;
  thumbnail?: string;
  infoLink?: string;
};

export default function RecommendPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [nickname, setNickname] = useState<string>("ホンキ");
  const [recommendations, setRecommendations] = useState<RecommendedBook[]>([]);
  const [topAuthors, setTopAuthors] = useState<string[]>([]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (!error && user?.user_metadata?.nickname) {
          setNickname(user.user_metadata.nickname);
        }
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
      }
    };

    const fetchRecommendations = async () => {
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

        const posts: Post[] = await res.json();
        
        if (posts.length === 0) {
          setLoading(false);
          return;
        }

        // 著者を集計
        const authorMap = new Map<string, number>();
        posts.forEach(post => {
          if (!post.book_author) return;
          authorMap.set(post.book_author, (authorMap.get(post.book_author) || 0) + 1);
        });

        // トップ3著者を取得
        const authors = Array.from(authorMap.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([author]) => author);
        
        setTopAuthors(authors);

        // 既に読んだ本のタイトルセット
        const readTitles = new Set(posts.map(p => p.book_title.toLowerCase()));

        // 各著者のおすすめ本を取得
        const allRecommendations: RecommendedBook[] = [];
        
        for (const author of authors) {
          try {
            const query = encodeURIComponent(`inauthor:${author}`);
            const gres = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=5&langRestrict=ja`);
            
            if (gres.ok) {
              const gdata = await gres.json();
              const items = gdata?.items || [];
              
              items.forEach((item: any) => {
                const volumeInfo = item.volumeInfo;
                const title = volumeInfo?.title;
                
                // 既に読んだ本は除外
                if (!title || readTitles.has(title.toLowerCase())) return;
                
                const authors = volumeInfo?.authors;
                const description = volumeInfo?.description || "説明はありません";
                const thumbnail = volumeInfo?.imageLinks?.thumbnail?.replace(/^http:/, 'https:') || 
                                 volumeInfo?.imageLinks?.smallThumbnail?.replace(/^http:/, 'https:');
                const infoLink = volumeInfo?.infoLink?.replace(/^http:/, 'https:');
                
                allRecommendations.push({
                  title,
                  author: authors ? authors.join(", ") : author,
                  description: description.length > 150 ? description.substring(0, 150) + "..." : description,
                  thumbnail,
                  infoLink,
                });
              });
            }
          } catch (err) {
            console.error(`Failed to fetch books for ${author}:`, err);
          }
        }

        // 重複を除去してランダムに8冊選択
        const uniqueRecommendations = allRecommendations.filter((book, index, self) =>
          index === self.findIndex(b => b.title === book.title)
        );
        
        const shuffled = uniqueRecommendations.sort(() => Math.random() - 0.5);
        setRecommendations(shuffled.slice(0, 8));
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
    fetchRecommendations();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen dark:from-slate-950 dark:to-slate-900 p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center py-12">
            <p className="text-slate-500 dark:text-slate-400">おすすめを分析中...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-amber-50 dark:bg-amber-950 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => router.push('/')}
            className="mb-3 text-amber-800 dark:text-amber-300 hover:text-amber-600 dark:hover:text-amber-200 transition-colors text-sm font-medium flex items-center gap-1"
          >
            <span>←</span>
            <span>{nickname}録に戻る</span>
          </button>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-amber-900 dark:text-amber-100 mb-2">
            ✨ あなたへのおすすめ
          </h1>
          {topAuthors.length > 0 && (
            <p className="text-amber-700 dark:text-amber-400 text-xs">
              よく読む著者：{topAuthors.join("、")} の作品を中心に選びました
            </p>
          )}
        </div>

        {recommendations.length === 0 ? (
          <div className="bg-white dark:bg-amber-900 border-2 border-amber-300 dark:border-amber-700 rounded-xl p-8 shadow-lg text-center">
            <p className="text-sm text-amber-800 dark:text-amber-200 mb-3">
              おすすめを表示するには、まず本を登録してください
            </p>
            <button
              onClick={() => router.push('/post')}
              className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-sm font-medium transition-colors shadow-md"
            >
              最初の本を登録する
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recommendations.map((book, index) => (
              <div
                key={index}
                className="bg-white dark:bg-amber-900 border-2 border-amber-300 dark:border-amber-700 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                {book.thumbnail ? (
                  <div className="h-48 bg-amber-100 dark:bg-amber-800 flex items-center justify-center">
                    <img
                      src={book.thumbnail}
                      alt={book.title}
                      className="h-full w-auto object-contain"
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-amber-200 dark:bg-amber-800 flex items-center justify-center">
                    <span className="text-4xl">📚</span>
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-bold text-amber-900 dark:text-amber-100 mb-2 line-clamp-2">
                    {book.title}
                  </h3>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mb-2 flex items-center gap-1">
                    <span>✒️</span>
                    <span>{book.author}</span>
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mb-4 line-clamp-3">
                    {book.description}
                  </p>
                  {book.infoLink && (
                    <a
                      href={book.infoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-center px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white text-sm rounded-lg transition-colors shadow-md"
                    >
                      詳細を見る
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
