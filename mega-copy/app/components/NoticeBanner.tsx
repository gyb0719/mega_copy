'use client';

import { MessageCircle } from 'lucide-react';

export default function NoticeBanner() {
  return (
    <div className="bg-mega-black text-white py-12 px-4">
      <div className="container mx-auto text-center">
        {/* 공지사항 배지 */}
        <div className="inline-block bg-mega-red text-white px-6 py-2 rounded-md mb-6">
          <span className="font-bold text-lg">공지사항</span>
        </div>

        {/* 공지 내용 */}
        <h2 className="text-xl md:text-2xl mb-2">모든 주문/상담은</h2>
        <h2 className="text-xl md:text-2xl mb-8">카카오톡에서 진행합니다</h2>

        {/* 카카오톡 버튼 */}
        <a
          href="http://pf.kakao.com/_xjxexdG"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-mega-yellow text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-yellow-400 transition-colors"
        >
          <MessageCircle className="w-6 h-6" />
          카카오톡 문의하기
        </a>
      </div>
    </div>
  );
}