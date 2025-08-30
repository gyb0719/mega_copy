import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 회사 정보 */}
          <div>
            <h3 className="font-bold text-lg mb-3">MEGA COPY</h3>
            <p className="text-gray-400 text-sm">
              프리미엄 패션 전문 쇼핑몰
            </p>
          </div>

          {/* 고객 지원 */}
          <div>
            <h3 className="font-bold text-lg mb-3">고객 지원</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://open.kakao.com/o/smsyINOh" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="text-gray-400 hover:text-white transition-colors">
                  카카오톡 문의
                </a>
              </li>
            </ul>
          </div>

          {/* 법적 고지 */}
          <div>
            <h3 className="font-bold text-lg mb-3">법적 고지</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                  이용약관
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  개인정보처리방침
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="text-center text-sm text-gray-400">
            <p className="mb-2">
              ⚠️ 본 쇼핑몰에서 판매하는 모든 상품은 프리미엄 품질의 제품이며, 정품이 아닙니다.
            </p>
            <p>
              © 2025 MEGA COPY. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}