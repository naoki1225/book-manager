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

type MonthlyStats = {
  month: string;
  count: number;
};

type AuthorStats = {
  author: string;
  count: number;
};

export default function StatsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [nickname, setNickname] = useState<string>("ホンキ");
  const [totalBooks, setTotalBooks] = useState(0);
  const [thisYearBooks, setThisYearBooks] = useState(0);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([]);
  const [topAuthors, setTopAuthors] = useState<AuthorStats[]>([]);

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
        setPosts(Array.isArray(data) ? data : []);
        analyzeStats(data);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
    fetchPosts();
  }, [router]);

  const analyzeStats = (posts: Post[]) => {
    // 総冊数
    setTotalBooks(posts.length);

    // 今年読んだ本
    const currentYear = new Date().getFullYear();
    const thisYear = posts.filter(post => {
      if (!post.created_at) return false;
      const year = new Date(post.created_at).getFullYear();
      return year === currentYear;
    });
    setThisYearBooks(thisYear.length);

    // 月別統計（過去6ヶ月）
    const monthMap = new Map<string, number>();
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthMap.set(key, 0);
    }

    posts.forEach(post => {
      if (!post.created_at) return;
      const d = new Date(post.created_at);
      const key = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (monthMap.has(key)) {
        monthMap.set(key, (monthMap.get(key) || 0) + 1);
      }
    });

    const monthly = Array.from(monthMap.entries()).map(([month, count]) => ({
      month,
      count,
    }));
    setMonthlyStats(monthly);

    // 著者別統計（トップ5）
    const authorMap = new Map<string, number>();
    posts.forEach(post => {
      if (!post.book_author) return;
      const author = post.book_author;
      authorMap.set(author, (authorMap.get(author) || 0) + 1);
    });

    const authors = Array.from(authorMap.entries())
      .map(([author, count]) => ({ author, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    setTopAuthors(authors);
  };

  if (loading) {
    return (
      <main className="min-h-screen dark:from-slate-950 dark:to-slate-900 p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center py-12">
            <p className="text-slate-500 dark:text-slate-400">読み込み中...</p>
          </div>
        </div>
      </main>
    );
  }

  const maxMonthlyCount = Math.max(...monthlyStats.map(s => s.count), 1);

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
            📊 読書統計
          </h1>
        </div>

        {/* サマリーカード */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white dark:bg-amber-900 border-2 border-amber-300 dark:border-amber-700 rounded-xl p-4 shadow-lg">
            <p className="text-xs text-amber-700 dark:text-amber-300 font-medium mb-1">📚 総読書数</p>
            <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">{totalBooks}</p>
            <p className="text-xs text-amber-600 dark:text-amber-400">冊</p>
          </div>

          <div className="bg-white dark:bg-amber-900 border-2 border-amber-300 dark:border-amber-700 rounded-xl p-4 shadow-lg">
            <p className="text-xs text-amber-700 dark:text-amber-300 font-medium mb-1">📅️ 今年読んだ本</p>
            <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">{thisYearBooks}</p>
            <p className="text-xs text-amber-600 dark:text-amber-400">冊</p>
          </div>

          <div className="bg-white dark:bg-amber-900 border-2 border-amber-300 dark:border-amber-700 rounded-xl p-4 shadow-lg">
            <p className="text-xs text-amber-700 dark:text-amber-300 font-medium mb-1">📈 月平均</p>
            <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
              {thisYearBooks > 0 ? (thisYearBooks / (new Date().getMonth() + 1)).toFixed(1) : '0.0'}
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400">冊/月</p>
          </div>
        </div>

        {/* 月別グラフ */}
        <div className="bg-white dark:bg-amber-900 border-2 border-amber-300 dark:border-amber-700 rounded-xl p-4 shadow-lg mb-6">
          <h2 className="text-lg font-bold text-amber-900 dark:text-amber-100 mb-4">📅 過去6ヶ月の読書数</h2>
          <div className="space-y-3">
            {monthlyStats.map((stat) => (
              <div key={stat.month}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-amber-800 dark:text-amber-300 font-medium">{stat.month}</span>
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-100">{stat.count}冊</span>
                </div>
                <div className="w-full bg-amber-200 dark:bg-amber-800 rounded-full h-2">
                  <div
                    className="bg-amber-600 dark:bg-amber-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(stat.count / maxMonthlyCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* よく読む著者 */}
        <div className="bg-white dark:bg-amber-900 border-2 border-amber-300 dark:border-amber-700 rounded-xl p-4 shadow-lg">
          <h2 className="text-lg font-bold text-amber-900 dark:text-amber-100 mb-4">✒️ よく読む著者 Top 5</h2>
          {topAuthors.length > 0 ? (
            <div className="space-y-3">
              {topAuthors.map((author, index) => (
                <div key={author.author} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-700 dark:bg-amber-600 flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-xs">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">{author.author}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-amber-800 dark:text-amber-200">{author.count}</p>
                    <p className="text-xs text-amber-600 dark:text-amber-400">冊</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-amber-600 dark:text-amber-400">著者情報がある本を追加してください</p>
          )}
        </div>
      </div>
    </main>
  );
}
