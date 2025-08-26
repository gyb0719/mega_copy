@echo off
echo =============================================
echo   DevYB Shop - E-Commerce Platform Setup
echo =============================================
echo.

echo [1/2] Frontend 프로젝트 생성 중...
call npx create-next-app@latest devyb-shop --typescript --tailwind --app --no-git --yes
cd devyb-shop

echo.
echo [2/2] 필수 패키지 설치 중...
call npm install zustand swr axios framer-motion react-hot-toast lucide-react @stripe/stripe-js stripe react-intersection-observer

echo.
echo =============================================
echo   Frontend 설정 완료!
echo =============================================
echo.

cd ..
echo Backend 프로젝트 생성 중...
mkdir devyb-shop-api
cd devyb-shop-api

echo package.json 생성 중...
call npm init -y

echo Backend 패키지 설치 중...
call npm install express mongoose dotenv cors helmet morgan jsonwebtoken bcryptjs joi multer cloudinary socket.io stripe
call npm install -D @types/node @types/express nodemon typescript ts-node @types/cors @types/jsonwebtoken @types/bcryptjs

echo.
echo =============================================
echo   ✅ 모든 설정이 완료되었습니다!
echo =============================================
echo.
echo 다음 단계:
echo 1. MongoDB Atlas 계정 생성 (https://cloud.mongodb.com)
echo 2. Cloudinary 계정 생성 (https://cloudinary.com)
echo 3. Stripe 계정 생성 (https://stripe.com)
echo 4. 환경 변수 설정 (.env 파일)
echo.
echo Frontend 실행: cd devyb-shop && npm run dev
echo Backend 실행: cd devyb-shop-api && npm run dev
echo.
pause