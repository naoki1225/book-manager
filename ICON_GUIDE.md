# アプリアイコン作成ガイド

このファイルに以下のアイコンを配置してください：

## 必要なファイル

```
public/
├── icon-192.png          # 192x192px (PWA, Android)
├── icon-512.png          # 512x512px (PWA スプラッシュ)
├── icon-maskable-192.png # 192x192px (マスカブル形式、iOS)
├── icon-maskable-512.png # 512x512px (マスカブル形式、iOS)
├── screenshot-1.png      # 540x720px (モバイル用スクリーンショット)
└── screenshot-2.png      # 1280x720px (タブレット用スクリーンショット)
```

## オンラインで素早く作成する方法

### 1. ロゴ作成ツール（無料）
- [Canva](https://www.canva.com) - テンプレートから簡単作成
- [Logo Makr](https://logomakr.com) - シンプルなロゴエディタ
- [Looka](https://looka.com) - AI で自動生成（有料オプションあり）

### 2. アイコン変換ツール
- [Favicon Generator](https://www.favicongenerator.com)
- [App Icon Generator](https://www.appicongenerator.com)

推奨デザイン：
- 背景：木目調の#92400e（アプリのテーマカラー）
- テキスト：「本」という漢字を白文字で大きく
- シンプルで四角いデザイン推奨

## ローカルで作成する方法（より手軽）

```bash
# ImageMagick でレスポンシブなアイコンを生成
npm install -g pwa-asset-generator

pwa-asset-generator logo.png ./public/

# logo.png から自動的に必要なサイズのアイコンを生成
```

## App Store・Google Play 用の追加画像

アプリ公開時には以下も必要：
- **アプリアイコン**: 1024x1024px（最高品質版）
- **スクリーンショット**: 5～6枚（実際の機能を表示）
- **プレビュー動画**: 15～30秒（オプション）

Figma や Sketch を使用して、スマホスクリーンのモックアップを作成するのが便利です。

## 次のステップ

1. 上記のいずれかの方法でアイコン画像を作成
2. `public/` に保存
3. `npm run build:app` を実行してアプリをビルド
4. iOS/Android でテスト
