/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages 배포를 위한 설정
  output: 'export',
  trailingSlash: true,
  
  // 이미지 도메인 허용
  images: {
    domains: [
      'nzmscqfrmxqcukhshsok.supabase.co',
      'via.placeholder.com'
    ],
    unoptimized: true // Cloudflare Pages는 Next.js Image Optimization을 지원하지 않음
  },

  // 환경변수
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nzmscqfrmxqcukhshsok.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56bXNjcWZybXhxY3VraHNoc29rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMTg1NDMsImV4cCI6MjA3MTc5NDU0M30.o0zQtPEjsuJnfQnY2MiakuM2EvTlVuRO9yeoajrwiLU'
  },

  // 실험적 기능
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    }
  },

  // 빌드 시 eslint 경고 무시
  eslint: {
    ignoreDuringBuilds: true
  },

  // TypeScript 에러 무시 (배포용)
  typescript: {
    ignoreBuildErrors: true
  }
}

module.exports = nextConfig