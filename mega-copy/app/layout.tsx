import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MEGA COPY - 명품 레플리카 쇼핑몰",
  description: "최고급 명품 레플리카 전문 쇼핑몰 MEGA COPY",
  keywords: "명품 레플리카, 명품 복제품, 럭셔리 브랜드",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="bg-gray-50">{children}</body>
    </html>
  );
}