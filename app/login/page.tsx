"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [message, setMessage] = useState("");

  const signIn = async () => {
    setMessage("");
    
    if (!email || !password) {
      setMessage("メールアドレスとパスワードを入力してください");
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("ログインエラー:", error);
      setMessage(`ログインエラー: ${error.message}`);
      return;
    }

    setMessage("ログイン成功！リダイレクト中...");
    
    // セッションが確立されるのを少し待つ
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // ページ全体をリロードしてサーバー側でセッションを確立
    window.location.href = "/";
  };

  const signUp = async () => {
    setMessage("");
    
    if (!email || !password) {
      setMessage("メールアドレスとパスワードを入力してください");
      return;
    }

    if (!nickname || nickname.trim().length === 0) {
      setMessage("ニックネームを入力してください");
      return;
    }

    if (password.length < 6) {
      setMessage("パスワードは6文字以上である必要があります");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          nickname: nickname.trim(),
        },
      },
    });

    if (error) {
      console.error("サインアップエラー:", error);
      setMessage(`サインアップエラー: ${error.message}`);
      return;
    }

    // Supabaseの設定によってはメール確認が必要
    if (data?.user?.identities?.length === 0) {
      setMessage("このメールアドレスは既に登録されています");
      return;
    }

    setMessage(`登録完了！${nickname}録へようこそ！メール確認が必要な場合は、受信したメールを確認してください。確認不要の場合は、そのままログインできます。`);
    setNickname("");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-amber-50 dark:bg-amber-950 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-amber-900 rounded-lg shadow-xl p-6 space-y-4 border-2 border-amber-200 dark:border-amber-700">
          <div className="text-center">
            <h1 className="text-2xl font-serif font-bold text-amber-900 dark:text-amber-100 mb-1">ホンキ録</h1>
            <p className="text-xs text-amber-700 dark:text-amber-300">あなたの読書記録を残そう</p>
          </div>

          {message && (
            <div
              className={`p-3 rounded-lg text-xs ${
                message.includes("エラー")
                  ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
                  : "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
              }`}
            >
              {message}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                メールアドレス
              </label>
              <input
                placeholder="your@email.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:ring-2 focus:ring-stone-500 dark:focus:ring-stone-400 focus:border-transparent transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                パスワード
              </label>
              <input
                type="password"
                placeholder="6文字以上"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && signIn()}
                className="w-full px-4 py-3 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:ring-2 focus:ring-stone-500 dark:focus:ring-stone-400 focus:border-transparent transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                ニックネーム <span className="text-xs text-stone-500">(新規登録時のみ)</span>
              </label>
              <input
                type="text"
                placeholder="例: ガチャピン"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:ring-2 focus:ring-stone-500 dark:focus:ring-stone-400 focus:border-transparent transition-all outline-none"
              />
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                入力したニックネームが「〇〇録」のアプリ名になります
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={signIn}
              className="w-full px-6 py-3 bg-stone-700 hover:bg-stone-800 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all"
            >
              ログイン
            </button>
            <button
              onClick={signUp}
              className="w-full px-6 py-3 bg-white hover:bg-stone-50 dark:bg-stone-700 dark:hover:bg-stone-600 text-stone-800 dark:text-stone-100 font-medium rounded-lg border border-stone-300 dark:border-stone-600 shadow-sm hover:shadow-md transition-all"
            >
              新規登録
            </button>
          </div>

          <div className="text-center text-xs text-stone-500 dark:text-stone-400 pt-4">
            読んだ本の記録を残して、あなただけの本棚を作りましょう
          </div>
        </div>
      </div>
    </main>
  );
}
