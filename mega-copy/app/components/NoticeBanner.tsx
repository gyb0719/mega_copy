'use client'

import { ChevronRight } from 'lucide-react'

export default function NoticeBanner() {
  return (
    <>
      <div className="bg-gradient-to-r from-gray-900 via-black to-gray-900">
        <div className="h-0.5 bg-gradient-to-r from-transparent via-mega-yellow to-transparent" />
        <div className="container mx-auto">
          <div className="relative">
            {/* 모바일 */}
            <div className="md:hidden px-4 py-3">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-mega-yellow text-black px-2 py-0.5 rounded-sm text-xs font-black">
                  공지
                </span>
                <p className="text-white text-sm font-black flex-1">
                  모든 상담은 카카오톡으로 진행됩니다
                </p>
              </div>
              <a
                href="https://open.kakao.com/o/smsyINOh"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-mega-yellow active:bg-yellow-500 text-black px-4 py-3 rounded-lg font-black text-base w-full transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#3C1E1E">
                  <path d="M12 3C6.48 3 2 6.58 2 11C2 13.72 3.64 16.09 6.05 17.4L5.27 20.45C5.21 20.67 5.31 20.9 5.5 21C5.69 21.1 5.92 21.04 6.05 20.87L9.88 17.19C10.58 17.34 11.29 17.42 12 17.42C17.52 17.42 22 13.92 22 11C22 6.58 17.52 3 12 3Z" />
                </svg>
                카카오톡 문의하기
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>

            {/* 데스크탑 */}
            <div className="hidden md:flex items-center justify-center gap-6 px-6 py-3">
              <div className="flex items-center gap-3">
                <span className="bg-mega-yellow text-black px-3 py-1 rounded font-black text-xs tracking-wider">
                  공지사항
                </span>
                <p className="text-white font-black">
                  모든 주문 및 상담은{' '}
                  <span className="text-mega-yellow font-black">카카오톡</span>
                  에서만 진행됩니다
                </p>
                <div className="w-px h-4 bg-gray-600" />
                <a
                  href="https://open.kakao.com/o/smsyINOh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-mega-yellow hover:bg-yellow-400 text-black px-5 py-2 rounded-md font-black text-sm transition-all hover:scale-105"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#3C1E1E">
                    <path d="M12 3C6.48 3 2 6.58 2 11C2 13.72 3.64 16.09 6.05 17.4L5.27 20.45C5.21 20.67 5.31 20.9 5.5 21C5.69 21.1 5.92 21.04 6.05 20.87L9.88 17.19C10.58 17.34 11.29 17.42 12 17.42C17.52 17.42 22 13.92 22 11C22 6.58 17.52 3 12 3Z" />
                  </svg>
                  문의하기
                  <ChevronRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="h-0.5 bg-gradient-to-r from-transparent via-mega-yellow to-transparent" />
      </div>
    </>
  )
}