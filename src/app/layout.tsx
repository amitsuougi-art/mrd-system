import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "市場営業部 業務システム",
  description: "固定金利融資 期限前弁済手数料算出システム（デモ版）",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
