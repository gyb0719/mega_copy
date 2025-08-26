import type { Metadata, Viewport } from "next";
import "./globals.css";
import ServiceWorkerRegistration from './components/ServiceWorkerRegistration';

export const metadata: Metadata = {
  title: "MEGA COPY - 명품 레플리카 쇼핑몰",
  description: "최고급 명품 레플리카 전문 쇼핑몰 MEGA COPY",
  keywords: "명품 레플리카, 명품 복제품, 럭셔리 브랜드",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MEGA COPY",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "MEGA COPY - 명품 레플리카 쇼핑몰",
    description: "최고급 명품 레플리카 전문 쇼핑몰",
    type: "website",
    locale: "ko_KR",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="bg-gray-50">
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}