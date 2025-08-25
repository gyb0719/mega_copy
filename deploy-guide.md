# DevYB Shop 배포 가이드

## 📦 프로젝트 정보
- **GitHub 리포지토리**: https://github.com/gyb0719/devyb-shop
- **프론트엔드**: Next.js 15.5 (devyb-shop 폴더)
- **백엔드**: Express + Node.js (devyb-shop-api 폴더)

## 🚀 Vercel 배포 방법

### 1. Vercel 계정 생성
1. https://vercel.com 접속
2. GitHub 계정으로 로그인

### 2. 프론트엔드 배포 (devyb-shop)
1. Vercel 대시보드에서 "New Project" 클릭
2. GitHub 리포지토리 `devyb-shop` 선택
3. 다음 설정 입력:
   - **Framework Preset**: Next.js
   - **Root Directory**: `devyb-shop`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`
4. 환경 변수 추가:
   ```
   NEXT_PUBLIC_API_URL=https://your-api-url.vercel.app
   ```
5. "Deploy" 클릭

### 3. 백엔드 배포 (devyb-shop-api)
1. 새 프로젝트 생성
2. 같은 리포지토리 선택
3. 다음 설정 입력:
   - **Framework Preset**: Other
   - **Root Directory**: `devyb-shop-api`
   - **Build Command**: `npm install`
   - **Output Directory**: (비워두기)
4. 환경 변수 추가:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   STRIPE_SECRET_KEY=your_stripe_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   ```
5. "Deploy" 클릭

## 🌐 Netlify 대안 배포

### Netlify로 프론트엔드 배포
1. https://www.netlify.com 접속
2. GitHub 연동
3. 새 사이트 추가
4. 빌드 설정:
   - **Base directory**: `devyb-shop`
   - **Build command**: `npm run build`
   - **Publish directory**: `devyb-shop/.next`
5. 배포

## 🖥️ GitHub Pages 배포 (정적 사이트만)

프론트엔드를 정적 사이트로 export하려면:

1. `devyb-shop/package.json`에 추가:
```json
"scripts": {
  "export": "next build && next export"
}
```

2. 빌드 및 배포:
```bash
cd devyb-shop
npm run export
# out 폴더가 생성됨
```

3. GitHub Pages 설정:
- Settings > Pages
- Source: Deploy from a branch
- Branch: gh-pages 선택

## 📱 로컬 테스트

### 프론트엔드
```bash
cd devyb-shop
npm install
npm run dev
# http://localhost:3000
```

### 백엔드
```bash
cd devyb-shop-api
npm install
npm start
# http://localhost:5000
```

## 🔗 배포 URL
- **프론트엔드**: 배포 후 Vercel이 제공하는 URL
- **백엔드 API**: 배포 후 Vercel이 제공하는 URL
- **GitHub 리포지토리**: https://github.com/gyb0719/devyb-shop

## 📝 참고사항
- MongoDB Atlas에서 무료 클러스터 생성 필요
- Stripe 계정 생성 및 API 키 필요
- Cloudinary 계정 생성 필요 (이미지 업로드용)