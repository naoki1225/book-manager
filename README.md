# ホンキ録 (Honki Roku) - 本記録アプリ

読んだ本や読みたい本の記録をシンプルに管理するアプリです。木目調のデザインで、スマホでも使えます。

## セットアップ手順

### 前提条件
- **Node.js 18.0 以上** が必要です
- **Git** がインストールされていることを確認してください

### 1. リポジトリをクローン

```bash
git clone <リポジトリURL>
cd book-manager
```

### 2. 依存パッケージをインストール

```bash
npm install
```

### 3. 環境変数を設定

`.env.local` ファイルをプロジェクトのルートに作成してください：

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Supabase 設定方法：**
1. [Supabase](https://supabase.com) にアクセスして無料でプロジェクトを作成
2. SQL Editor から下記を実行してテーブルを作成：

```sql
CREATE TABLE posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_title TEXT NOT NULL,
  book_author TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

3. Project Settings → API からURLとキーをコピーして `.env.local` に貼り付け

### 4. 開発サーバーを起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) にアクセスしてください

---

## スマホでの使用方法

### 方法 A: 同じネットワーク上で使用（最も簡単）

開発サーバーが起動している状態で：

```bash
# ターミナルで以下のコマンドを実行してマシンのIPアドレスを確認
# Windows PowerShell
ipconfig

# または macOS/Linux
ifconfig
```

マシンの IP アドレス（例：`192.168.1.100`）をメモして、スマホのブラウザで以下にアクセス：

```
http://192.168.1.100:3000
```

**注意：** PC とスマホが同じ WiFi に接続している必要があります

### 方法 B: インターネット経由で共有（外出先でもアクセス可能）

`localtunnel` または `ngrok` を使用してトンネルを作成：

#### localtunnel を使用

```bash
# グローバルインストール
npm install -g localtunnel

# 開発サーバーを起動（別のターミナル）
npm run dev

# localtunnel でトンネル作成（別のターミナル）
lt --port 3000
```

表示されたURL（例：`https://jolly-dog-1.loca.lt`）をスマホで開く

---

## 本番環境へのデプロイ

### Option A: Vercel にデプロイ（最も簡単・Web）

1. [Vercel](https://vercel.com) でアカウント登録
2. GitHub/GitLab でリポジトリを接続
3. 環境変数を設定（Project Settings → Environment Variables）
4. 自動でデプロイされ、公開 URL が発行される

すべての人がその URL で使用可能！

### Other Web Hosting Options

- **Railway**: https://railway.app
- **Netlify**: https://netlify.com
- **Render**: https://render.com

---

## iOS/Android ネイティブアプリ化

App Store・Google Play に公開できる実際のスマホアプリにするには **Capacitor** を使用します。

### 前提条件

- **macOS** （iOS ビルドに必要）
- **Xcode** （iOS）: App Store から無料ダウンロード
- **Android Studio** （Android）: https://developer.android.com からダウンロード
- **Java Development Kit (JDK) 11 以上**

### ステップ 1: ビルドとアプリ化

```bash
# 本番ビルド
npm run build:app

# iOS プロジェクト生成
npx cap add ios

# Android プロジェクト生成  
npx cap add android
```

### ステップ 2: iOS ビルド・公開

```bash
# Xcode で開く
npx cap open ios
```

Xcode で以下を設定：
1. **Bundle Identifier** を `com.honkiroku.app` に変更
2. **Signing & Capabilities** でApple Developer アカウントを設定
3. Product → Archive でビルド

**App Store に公開するには：**
1. [Apple Developer Program](https://developer.apple.com) に登録（年間$99）
2. 上記の Archive から App Store Connect にアップロード
3. レビュー待機（3～5日）→ 公開

### ステップ 3: Android ビルド・公開

```bash
# Android Studio で開く
npx cap open android
```

Android Studio で以下を設定：
1. **build.gradle** で versionCode と versionName を設定
2. **Release ビルド生成**：Build → Build Bundle(s) / APK(s)

**Google Play に公開するには：**
1. [Google Play Console](https://play.google.com/console) にアクセス
2. 上記の Release APK/Bundle をアップロード
3. テスト版→本番版へ段階的にリリース

### 完全な iOS 公開手順

```
1. Xcode でビルド → Archive
2. Organizer から App Store Connect にアップロード
3. TestFlight で事前テスト（オプション）
4. App Store レビュー申請
5. 承認後、自動的に公開
```

### 完全な Android 公開手順

```
1. Android Studio でリリースビルド生成
2. Google Play Console で新規アプリ作成
3. APK/Bundle をアップロード
4. ストア情報（説明、スクリーンショット等）を入力
5. 本番版でリリース
6. 24時間以内に Google Play で公開
```

---

## 各リリース方法の比較

| 方法 | 手軽さ | コスト | 配布範囲 | ユーザー体験 |
|------|--------|--------|----------|------------|
| Web (Vercel) | 🟢 最簡単 | 無料 | ブラウザ | PWA: ホーム画面にインストール可 |
| PWA | 🟢 簡単 | 無料 | iOS/Android | ネイティブアプリのような感覚 |
| iOS App Store | 🔴 難しい | $99/年 | Apple デバイス | 最高ユーザー体験 |
| Google Play | 🟡 中程度 | $25（一度のみ） | Android | 優れたユーザー体験 |

---

## アプリの機能

- 📚 **本の登録**: 書名と著者を記録
- 🖼️ **書影表示**: Open Library から自動で書影を取得
- 📖 **詳細表示**: 登録した本の情報を表示
- ✏️ **編集機能**: 登録内容を修正可能
- 📱 **レスポンシブ**: スマホ・PC 両対応
- 🎨 **木目調デザイン**: 温かみのあるUIで閲覧
- 📲 **オフライン対応**: PWA により基本機能がオフラインで使用可

---

## 使用技術

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **API**: Open Library, Google Books API
- **App Framework**: Capacitor (ネイティブアプリ化）
- **PWA**: Service Worker + Web Manifest

---

## トラブルシューティング

### スマホからアクセスできない場合
- PC とスマホが同じネットワークに接続しているか確認
- ファイアウォール設定を確認
- PC のファイアウォールが接続をブロックしていないか確認

### ビルドエラーが出た場合

```bash
# キャッシュをクリア
rm -rf .next
npm install
npm run build:app
```

### Supabase に接続できない場合
- `.env.local` の URL とキーが正しいか確認
- テーブルが作成されているか Supabase ダッシュボードで確認

### iOS ビルドエラー

```bash
# pod の再インストール
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
npx cap sync ios
```

### Android ビルドエラー

```bash
# gradle キャッシュをクリア
cd android
./gradlew clean
cd ..
npx cap sync android
```

---

## 開発者向け情報

```bash
# 本番ビルド
npm run build

# アプリビルド + 同期
npm run build:app

# iOS デバイステスト
npx cap run ios

# Android デバイステスト
npx cap run android

# リント実行
npm run lint
```

---

## 今すぐ始める

### 最短で App Store/Google Play に公開する流れ

1. **準備（5分）** - Capacitor ファイル作成（既に完了✅）
2. **ビルド（10分）** - `npm run build:app`
3. **iOS 開発アカウント登録（20分）** - Apple Developer Program
4. **iOS ビルド・テスト（30分）** - Xcode で Archive
5. **App Store 審査申請（10分）** - TestFlight → 本番
6. **公開待機（3～5日）** - Apple のレビュー中

同時に Android も同じ流れで進行可能。
