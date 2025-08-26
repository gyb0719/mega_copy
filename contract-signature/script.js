// PDF.js 워커 설정
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// 전역 변수
let pdfDoc = null;
let pageNum = 1;
let pageRendering = false;
let pageNumPending = null;
let scale = 1.5;
let signatureData = null;
let signedPdfData = null;

// 서명 캔버스 설정
const signatureCanvas = document.getElementById('signatureCanvas');
const signatureCtx = signatureCanvas.getContext('2d');
let isDrawing = false;
let lastX = 0;
let lastY = 0;

// 캔버스 크기 설정
function resizeSignatureCanvas() {
    const rect = signatureCanvas.getBoundingClientRect();
    signatureCanvas.width = rect.width;
    signatureCanvas.height = rect.height;
    signatureCtx.strokeStyle = '#000000';
    signatureCtx.lineWidth = 2;
    signatureCtx.lineCap = 'round';
    signatureCtx.lineJoin = 'round';
}

// 서명 그리기 이벤트
function startDrawing(e) {
    isDrawing = true;
    const rect = signatureCanvas.getBoundingClientRect();
    
    if (e.type.includes('touch')) {
        lastX = e.touches[0].clientX - rect.left;
        lastY = e.touches[0].clientY - rect.top;
    } else {
        lastX = e.offsetX;
        lastY = e.offsetY;
    }
}

function draw(e) {
    if (!isDrawing) return;
    
    e.preventDefault();
    
    const rect = signatureCanvas.getBoundingClientRect();
    let currentX, currentY;
    
    if (e.type.includes('touch')) {
        currentX = e.touches[0].clientX - rect.left;
        currentY = e.touches[0].clientY - rect.top;
    } else {
        currentX = e.offsetX;
        currentY = e.offsetY;
    }
    
    signatureCtx.beginPath();
    signatureCtx.moveTo(lastX, lastY);
    signatureCtx.lineTo(currentX, currentY);
    signatureCtx.stroke();
    
    lastX = currentX;
    lastY = currentY;
}

function stopDrawing() {
    isDrawing = false;
}

// 마우스 이벤트
signatureCanvas.addEventListener('mousedown', startDrawing);
signatureCanvas.addEventListener('mousemove', draw);
signatureCanvas.addEventListener('mouseup', stopDrawing);
signatureCanvas.addEventListener('mouseout', stopDrawing);

// 터치 이벤트 (모바일)
signatureCanvas.addEventListener('touchstart', startDrawing);
signatureCanvas.addEventListener('touchmove', draw);
signatureCanvas.addEventListener('touchend', stopDrawing);

// 서명 지우기
document.getElementById('clearSignature').addEventListener('click', () => {
    signatureCtx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
    signatureData = null;
});

// PDF 렌더링
function renderPage(num) {
    pageRendering = true;
    
    pdfDoc.getPage(num).then(function(page) {
        const canvas = document.getElementById('pdfCanvas');
        const ctx = canvas.getContext('2d');
        const viewport = page.getViewport({ scale: scale });
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        const renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };
        
        const renderTask = page.render(renderContext);
        
        renderTask.promise.then(function() {
            pageRendering = false;
            
            if (pageNumPending !== null) {
                renderPage(pageNumPending);
                pageNumPending = null;
            }
        });
    });
    
    document.getElementById('currentPage').textContent = num;
}

function queueRenderPage(num) {
    if (pageRendering) {
        pageNumPending = num;
    } else {
        renderPage(num);
    }
}

// 이전 페이지
document.getElementById('prevPage').addEventListener('click', () => {
    if (pageNum <= 1) return;
    pageNum--;
    queueRenderPage(pageNum);
    updatePageControls();
});

// 다음 페이지
document.getElementById('nextPage').addEventListener('click', () => {
    if (pageNum >= pdfDoc.numPages) return;
    pageNum++;
    queueRenderPage(pageNum);
    updatePageControls();
});

// 페이지 컨트롤 업데이트
function updatePageControls() {
    document.getElementById('prevPage').disabled = pageNum <= 1;
    document.getElementById('nextPage').disabled = pageNum >= pdfDoc.numPages;
}

// PDF 로드 (로컬 파일 또는 상대 경로)
const pdfPath = '../레플리카쇼핑몰_웹앱_계약서_2025.pdf';

pdfjsLib.getDocument(pdfPath).promise.then(function(pdfDoc_) {
    pdfDoc = pdfDoc_;
    
    document.getElementById('totalPages').textContent = pdfDoc.numPages;
    document.getElementById('loadingDiv').style.display = 'none';
    document.getElementById('pdfCanvas').style.display = 'block';
    document.getElementById('pageControls').style.display = 'flex';
    
    renderPage(pageNum);
    updatePageControls();
}).catch(function(error) {
    console.error('PDF 로드 에러:', error);
    document.getElementById('loadingDiv').innerHTML = `
        <p style="color: red;">PDF를 불러올 수 없습니다.</p>
        <p style="font-size: 12px;">파일 경로를 확인해주세요.</p>
    `;
});

// 서명 저장
document.getElementById('saveSignature').addEventListener('click', () => {
    const signerType = document.getElementById('signerType').value;
    const signerName = document.getElementById('signerName').value;
    
    if (!signerType) {
        alert('서명자 구분을 선택해주세요.');
        return;
    }
    
    if (!signerName) {
        alert('서명자 성명을 입력해주세요.');
        return;
    }
    
    // 캔버스가 비어있는지 확인
    const imageData = signatureCtx.getImageData(0, 0, signatureCanvas.width, signatureCanvas.height);
    const pixels = imageData.data;
    let isEmpty = true;
    
    for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i + 3] !== 0) {
            isEmpty = false;
            break;
        }
    }
    
    if (isEmpty) {
        alert('서명을 그려주세요.');
        return;
    }
    
    // 서명 데이터 저장
    signatureData = {
        type: signerType,
        name: signerName,
        signature: signatureCanvas.toDataURL(),
        date: new Date().toLocaleDateString('ko-KR')
    };
    
    // 버튼 활성화
    document.getElementById('downloadBtn').disabled = false;
    document.getElementById('kakaoShareBtn').disabled = false;
    document.getElementById('emailBtn').disabled = false;
    document.getElementById('printBtn').disabled = false;
    
    // 모달 표시
    document.getElementById('successModal').style.display = 'block';
});

// 모달 닫기
function closeModal() {
    document.getElementById('successModal').style.display = 'none';
}

// 다운로드
document.getElementById('downloadBtn').addEventListener('click', async () => {
    if (!signatureData) {
        alert('먼저 서명을 완료해주세요.');
        return;
    }
    
    // HTML을 이미지로 변환하여 다운로드
    const contractHTML = generateSignedContract();
    const blob = new Blob([contractHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `계약서_${signatureData.name}_${signatureData.date.replace(/\./g, '')}.html`;
    a.click();
    
    URL.revokeObjectURL(url);
    
    alert('서명된 계약서가 다운로드되었습니다.');
});

// 카카오톡 공유
document.getElementById('kakaoShareBtn').addEventListener('click', () => {
    if (!signatureData) {
        alert('먼저 서명을 완료해주세요.');
        return;
    }
    
    // 카카오톡 공유 메시지 생성
    const message = `[레플리카 쇼핑몰 웹앱 개발 계약서]
    
✅ 서명 완료
- ${signatureData.type}: ${signatureData.name}
- 서명일: ${signatureData.date}
- 계약금액: 1,320,000원 (VAT 포함)
- 개발기간: 2주

계약서를 확인하시려면 아래 링크를 클릭해주세요.`;
    
    // 카카오톡 공유 URL 생성 (웹 버전)
    const kakaoUrl = `https://accounts.kakao.com/login?continue=https://sharer.kakao.com/talk/friends/picker/shortlink/${encodeURIComponent(window.location.href)}`;
    
    // 모바일 체크
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        // 모바일에서는 카카오톡 앱 직접 실행
        window.location.href = `kakaolink://send?text=${encodeURIComponent(message)}`;
    } else {
        // PC에서는 카카오톡 PC 버전 또는 웹 공유
        alert('카카오톡 PC 버전에서 메시지를 직접 복사하여 전송해주세요:\n\n' + message);
    }
});

// 이메일 전송
document.getElementById('emailBtn').addEventListener('click', () => {
    if (!signatureData) {
        alert('먼저 서명을 완료해주세요.');
        return;
    }
    
    const subject = `[계약서] 레플리카 쇼핑몰 웹앱 개발 계약서 - ${signatureData.name}`;
    const body = `안녕하세요,

레플리카 쇼핑몰 웹앱 개발 계약서 서명이 완료되었습니다.

[서명 정보]
- ${signatureData.type}: ${signatureData.name}
- 서명일: ${signatureData.date}
- 계약금액: 1,320,000원 (VAT 포함)
- 개발기간: 2025년 8월 26일 ~ 2025년 9월 9일 (2주)

[계약 내용]
- Flutter Web 기반 반응형 쇼핑몰 개발
- 상품 관리, 검색 시스템, 공지사항 기능
- 카카오톡 상담 연동
- 관리자 페이지 포함

감사합니다.`;
    
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

// 인쇄
document.getElementById('printBtn').addEventListener('click', () => {
    if (!signatureData) {
        alert('먼저 서명을 완료해주세요.');
        return;
    }
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(generateSignedContract());
    printWindow.document.close();
    
    setTimeout(() => {
        printWindow.print();
    }, 500);
});

// 서명된 계약서 HTML 생성
function generateSignedContract() {
    return `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <title>서명된 계약서 - ${signatureData.name}</title>
        <style>
            body {
                font-family: 'Malgun Gothic', sans-serif;
                max-width: 800px;
                margin: 0 auto;
                padding: 40px 20px;
                line-height: 1.6;
            }
            h1 { text-align: center; margin-bottom: 40px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f5f5f5; }
            .signature-section {
                margin-top: 50px;
                padding: 20px;
                border: 2px solid #667eea;
                border-radius: 10px;
                background: #f8f9fa;
            }
            .signature-img {
                max-width: 300px;
                margin: 20px 0;
                border: 1px solid #ddd;
                padding: 10px;
                background: white;
            }
            .info-grid {
                display: grid;
                grid-template-columns: 120px 1fr;
                gap: 10px;
                margin: 10px 0;
            }
            .label { font-weight: bold; color: #666; }
            @media print {
                body { padding: 20px; }
                .signature-section { break-inside: avoid; }
            }
        </style>
    </head>
    <body>
        <h1>소프트웨어 개발 계약서</h1>
        
        <h2>계약 정보</h2>
        <table>
            <tr><th>계약일자</th><td>2025년 8월 26일</td></tr>
            <tr><th>계약명</th><td>레플리카 쇼핑몰 웹앱 개발 계약</td></tr>
            <tr><th>개발방식</th><td>Flutter Web 개발</td></tr>
            <tr><th>개발기간</th><td>2주 (작업 시작일로부터)</td></tr>
        </table>
        
        <h2>계약 당사자</h2>
        <table>
            <tr><th colspan="2">발주자 (갑)</th></tr>
            <tr><th>성명</th><td>김병일</td></tr>
            <tr><th>주소</th><td>서울 동대문구 외대역동로 14, 104동 1002호</td></tr>
            <tr><th>연락처</th><td>010-9958-0601</td></tr>
        </table>
        
        <table style="margin-top: 10px;">
            <tr><th colspan="2">개발자 (을)</th></tr>
            <tr><th>성명</th><td>권용범</td></tr>
            <tr><th>주소</th><td>경기도 광명시 소하로 162, 702동 1404호</td></tr>
            <tr><th>연락처</th><td>010-3825-5659</td></tr>
        </table>
        
        <h2>개발 대금</h2>
        <table>
            <tr><th>개발비</th><td>1,200,000원</td></tr>
            <tr><th>VAT (10%)</th><td>120,000원</td></tr>
            <tr><th>총 지급액</th><td><strong>1,320,000원</strong></td></tr>
        </table>
        
        <div class="signature-section">
            <h2>✅ 전자 서명 확인</h2>
            <div class="info-grid">
                <div class="label">서명자 구분:</div>
                <div>${signatureData.type === '갑' ? '발주자 (갑)' : '개발자 (을)'}</div>
                <div class="label">서명자 성명:</div>
                <div>${signatureData.name}</div>
                <div class="label">서명일시:</div>
                <div>${signatureData.date}</div>
            </div>
            <div style="margin-top: 20px;">
                <div class="label">서명:</div>
                <img src="${signatureData.signature}" class="signature-img" alt="서명">
            </div>
        </div>
        
        <p style="margin-top: 40px; text-align: center; color: #666; font-size: 14px;">
            본 계약서는 전자서명법에 따라 전자서명되었으며, 법적 효력을 가집니다.
        </p>
    </body>
    </html>
    `;
}

// 윈도우 리사이즈 시 서명 캔버스 크기 재조정
window.addEventListener('resize', resizeSignatureCanvas);
resizeSignatureCanvas();