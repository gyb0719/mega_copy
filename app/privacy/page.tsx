'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 h-14">
            <Link href="/" className="p-2">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="font-bold text-lg">개인정보처리방침</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="bg-white rounded-lg p-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold mb-3">1. 개인정보의 수집 및 이용목적</h2>
            <p className="text-gray-700 leading-relaxed">
              MEGA COPY는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
            </p>
            <ul className="mt-2 space-y-1 text-gray-700">
              <li>• 상품 문의 및 상담</li>
              <li>• 고객 서비스 제공</li>
              <li>• 마케팅 및 광고에 활용</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-3">2. 수집하는 개인정보 항목</h2>
            <ul className="space-y-1 text-gray-700">
              <li>• 필수항목: 이름, 연락처</li>
              <li>• 선택항목: 이메일, 배송지 주소</li>
              <li>• 자동수집항목: IP주소, 쿠키, 방문일시, 서비스 이용기록</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-3">3. 개인정보의 보유 및 이용기간</h2>
            <p className="text-gray-700 leading-relaxed">
              회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
            </p>
            <ul className="mt-2 space-y-1 text-gray-700">
              <li>• 고객 문의 기록: 3년</li>
              <li>• 전자상거래 관련 기록: 5년</li>
              <li>• 접속 로그 기록: 3개월</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-3">4. 개인정보의 제3자 제공</h2>
            <p className="text-gray-700 leading-relaxed">
              MEGA COPY는 정보주체의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만, 다음의 경우에는 예외로 합니다.
            </p>
            <ul className="mt-2 space-y-1 text-gray-700">
              <li>• 정보주체의 사전 동의를 받은 경우</li>
              <li>• 법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-3">5. 개인정보의 파기</h2>
            <p className="text-gray-700 leading-relaxed">
              개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-3">6. 정보주체의 권리·의무 및 행사방법</h2>
            <p className="text-gray-700 leading-relaxed">
              정보주체는 개인정보 열람, 정정, 삭제, 처리정지 요구 등의 권리를 행사할 수 있습니다. 권리 행사는 카카오톡 채널을 통해 하실 수 있습니다.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-3">7. 개인정보 보호책임자</h2>
            <p className="text-gray-700">
              성명: 김병일<br/>
              연락처: 010-9958-0601
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-3">8. 개인정보처리방침 변경</h2>
            <p className="text-gray-700">
              이 개인정보처리방침은 2025년 9월 1일부터 적용됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}