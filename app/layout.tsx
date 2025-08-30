import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MEGA COPY - 프리미엄 패션 쇼핑몰",
  description: "고품질 패션 제품 전문 쇼핑몰 MEGA COPY",
  keywords: "패션, 가방, 신발, 시계, 액세서리",
  manifest: "/manifest.json",
  icons: {
    icon: "/mega_copy_logo.png",
    apple: "/mega_copy_logo.png"
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MEGA COPY",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "MEGA COPY - 프리미엄 패션 쇼핑몰",
    description: "고품질 패션 제품 전문 쇼핑몰",
    type: "website",
    locale: "ko_KR",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false,
  themeColor: "#FFD700",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="icon" href="/mega_copy_logo.png" />
        <link rel="apple-touch-icon" href="/mega_copy_logo.png" />
        <link rel="shortcut icon" href="/mega_copy_logo.png" />
      </head>
      <body className="bg-gray-50">
        {children}
        {}
      </body>
    </html>
  );
}