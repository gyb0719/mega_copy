'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 h-14">
            <Link href="/" className="p-2">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="font-bold text-lg">이용약관</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="bg-white rounded-lg p-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold mb-3">제1조 (목적)</h2>
            <p className="text-gray-700 leading-relaxed">
              이 약관은 MEGA COPY(이하 "회사")가 운영하는 온라인 쇼핑몰에서 제공하는 서비스(이하 "서비스")를 이용함에 있어 회사와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-3">제2조 (용어의 정의)</h2>
            <ul className="space-y-2 text-gray-700">
              <li>① "쇼핑몰"이란 회사가 상품을 이용자에게 제공하기 위하여 컴퓨터 등 정보통신설비를 이용하여 상품을 거래할 수 있도록 설정한 가상의 영업장을 말합니다.</li>
              <li>② "이용자"란 쇼핑몰에 접속하여 이 약관에 따라 회사가 제공하는 서비스를 받는 회원 및 비회원을 말합니다.</li>
              <li>③ "회원"이라 함은 쇼핑몰에 개인정보를 제공하여 회원등록을 한 자로서, 쇼핑몰의 정보를 지속적으로 제공받으며, 쇼핑몰이 제공하는 서비스를 계속적으로 이용할 수 있는 자를 말합니다.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-3">제3조 (약관의 명시와 개정)</h2>
            <p className="text-gray-700 leading-relaxed">
              ① 회사는 이 약관의 내용과 상호, 영업소 소재지, 대표자의 성명, 사업자등록번호, 연락처 등을 이용자가 알 수 있도록 쇼핑몰의 초기 서비스화면에 게시합니다.<br/>
              ② 회사는 약관의 규제에 관한 법률, 전자거래기본법, 전자서명법, 정보통신망 이용촉진 및 정보보호 등에 관한 법률, 방문판매 등에 관한 법률, 소비자보호법 등 관련법을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-3">제4조 (서비스의 제공 및 변경)</h2>
            <p className="text-gray-700 leading-relaxed">
              ① 회사는 다음과 같은 업무를 수행합니다.
            </p>
            <ul className="mt-2 space-y-1 text-gray-700">
              <li>• 상품에 대한 정보 제공</li>
              <li>• 구매계약 체결 및 구매계약이 체결된 상품의 배송</li>
              <li>• 기타 회사가 정하는 업무</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-3">제5조 (상품의 구매)</h2>
            <p className="text-gray-700 leading-relaxed">
              이용자는 쇼핑몰에서 다음 또는 이와 유사한 방법으로 구매를 신청하며, 회사는 이용자가 구매신청을 함에 있어서 각 내용을 알기 쉽게 제공하여야 합니다.
            </p>
            <ul className="mt-2 space-y-1 text-gray-700">
              <li>• 상품의 검색 및 선택</li>
              <li>• 성명, 주소, 전화번호 등의 입력</li>
              <li>• 약관내용, 청약철회권이 제한되는 서비스 확인</li>
              <li>• 결제방법의 선택</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-3">제6조 (상품 정보 고지)</h2>
            <p className="text-gray-700 leading-relaxed">
              본 쇼핑몰에서 판매하는 상품은 프리미엄 레플리카 제품입니다. 정품이 아님을 명확히 고지하며, 구매 시 이 점을 충분히 인지하고 구매하시기 바랍니다.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-3">제7조 (개인정보보호)</h2>
            <p className="text-gray-700 leading-relaxed">
              회사는 이용자의 정보수집시 구매계약 이행에 필요한 최소한의 정보를 수집합니다. 회사가 수집한 개인정보는 개인정보처리방침에 따라 관리됩니다.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-3">제8조 (분쟁해결)</h2>
            <p className="text-gray-700 leading-relaxed">
              ① 회사는 이용자가 제기하는 정당한 의견이나 불만을 반영하고 그 피해를 보상처리하기 위하여 피해보상처리기구를 설치·운영합니다.<br/>
              ② 회사는 이용자로부터 제출되는 불만사항 및 의견은 우선적으로 그 사항을 처리합니다.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-3">제9조 (면책조항)</h2>
            <p className="text-gray-700 leading-relaxed">
              ① 회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.<br/>
              ② 회사는 이용자의 귀책사유로 인한 서비스 이용의 장애에 대하여 책임을 지지 않습니다.
            </p>
          </div>

          <div className="pt-4 border-t">
            <p className="text-gray-600 text-sm">
              본 약관은 2025년 1월 1일부터 시행됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}