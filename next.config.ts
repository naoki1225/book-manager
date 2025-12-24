import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "export" - 本番ビルド時のみ使用（build:app 実行時）
  // images: unoptimized - export モード時のみ必要
};

export default nextConfig;
