# PowerShell 프로젝트 자동 시작 스크립트
# 사용법: .\project-starter.ps1 -ProjectName "my-project" -ProjectType "nextjs"

param(
    [Parameter(Mandatory=$true)]
    [string]$ProjectName,
    
    [Parameter(Mandatory=$true)]
    [ValidateSet("nextjs", "react", "vue", "express", "fastapi", "flutter")]
    [string]$ProjectType,
    
    [switch]$WithSupabase,
    [switch]$WithAuth,
    [switch]$WithPayment,
    [switch]$WithDocker
)

Write-Host "🚀 프로젝트 시작: $ProjectName ($ProjectType)" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan

# 프로젝트 디렉토리 생성
$ProjectPath = Join-Path $PSScriptRoot $ProjectName
if (Test-Path $ProjectPath) {
    Write-Host "⚠️  디렉토리가 이미 존재합니다. 덮어쓰시겠습니까? (Y/N)" -ForegroundColor Yellow
    $confirm = Read-Host
    if ($confirm -ne 'Y') {
        Write-Host "❌ 프로젝트 생성 취소" -ForegroundColor Red
        exit
    }
    Remove-Item $ProjectPath -Recurse -Force
}

# 프로젝트별 초기화
switch ($ProjectType) {
    "nextjs" {
        Write-Host "📦 Next.js 프로젝트 생성 중..." -ForegroundColor Cyan
        
        # Next.js 프로젝트 생성
        npx create-next-app@latest $ProjectName --typescript --tailwind --app --eslint --no-src-dir --import-alias "@/*"
        
        Set-Location $ProjectPath
        
        # 필수 패키지 설치
        Write-Host "📦 필수 패키지 설치 중..." -ForegroundColor Cyan
        npm install lucide-react clsx tailwind-merge sonner @tanstack/react-query
        npm install -D @types/node prettier eslint-config-prettier
        
        if ($WithSupabase) {
            Write-Host "🗄️ Supabase 설정 중..." -ForegroundColor Cyan
            npm install @supabase/supabase-js @supabase/ssr
            
            # .env.local 파일 생성
            @"
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
"@ | Out-File -FilePath ".env.local" -Encoding UTF8
        }
        
        if ($WithAuth) {
            Write-Host "🔐 인증 시스템 설정 중..." -ForegroundColor Cyan
            npm install next-auth @auth/prisma-adapter
        }
        
        if ($WithPayment) {
            Write-Host "💳 결제 시스템 설정 중..." -ForegroundColor Cyan
            npm install stripe @stripe/stripe-js
        }
    }
    
    "react" {
        Write-Host "📦 React 프로젝트 생성 중..." -ForegroundColor Cyan
        npm create vite@latest $ProjectName -- --template react-ts
        Set-Location $ProjectPath
        npm install
        npm install axios react-router-dom lucide-react
    }
    
    "express" {
        Write-Host "📦 Express 프로젝트 생성 중..." -ForegroundColor Cyan
        New-Item -ItemType Directory -Path $ProjectPath
        Set-Location $ProjectPath
        npm init -y
        npm install express cors helmet morgan compression dotenv
        npm install -D @types/node @types/express typescript nodemon ts-node
        
        # TypeScript 설정
        npx tsc --init
    }
    
    "fastapi" {
        Write-Host "📦 FastAPI 프로젝트 생성 중..." -ForegroundColor Cyan
        New-Item -ItemType Directory -Path $ProjectPath
        Set-Location $ProjectPath
        
        # Python 가상환경 생성
        python -m venv venv
        & ".\venv\Scripts\Activate.ps1"
        
        # 패키지 설치
        pip install fastapi uvicorn sqlalchemy alembic pydantic python-dotenv
        
        # requirements.txt 생성
        pip freeze > requirements.txt
    }
    
    "flutter" {
        Write-Host "📦 Flutter 프로젝트 생성 중..." -ForegroundColor Cyan
        flutter create $ProjectName
        Set-Location $ProjectPath
        
        # 필수 패키지 추가
        flutter pub add dio provider go_router cached_network_image
        
        if ($WithSupabase) {
            flutter pub add supabase_flutter
        }
    }
}

# Docker 설정
if ($WithDocker) {
    Write-Host "🐳 Docker 설정 중..." -ForegroundColor Cyan
    
    # Dockerfile 생성
    $dockerfileContent = switch ($ProjectType) {
        "nextjs" {
@"
FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000

CMD ["node", "server.js"]
"@
        }
        "express" {
@"
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "index.js"]
"@
        }
        default { "" }
    }
    
    if ($dockerfileContent) {
        $dockerfileContent | Out-File -FilePath "Dockerfile" -Encoding UTF8
    }
    
    # docker-compose.yml 생성
@"
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    volumes:
      - .:/app
      - /app/node_modules
"@ | Out-File -FilePath "docker-compose.yml" -Encoding UTF8
}

# Git 초기화
Write-Host "📝 Git 초기화 중..." -ForegroundColor Cyan
git init
git add .
git commit -m "🎉 Initial commit: $ProjectName project setup"

# 프로젝트 구조 생성
Write-Host "📁 프로젝트 구조 생성 중..." -ForegroundColor Cyan

# 공통 디렉토리 생성
$directories = @(
    "docs",
    "tests",
    ".github/workflows"
)

foreach ($dir in $directories) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
}

# README.md 생성
@"
# $ProjectName

## 📋 프로젝트 개요
[프로젝트 설명]

## 🛠 기술 스택
- **Framework**: $ProjectType
$(if ($WithSupabase) { "- **Backend**: Supabase" })
$(if ($WithAuth) { "- **Authentication**: NextAuth.js" })
$(if ($WithPayment) { "- **Payment**: Stripe" })
$(if ($WithDocker) { "- **Containerization**: Docker" })

## 🚀 시작하기

### 환경 설정
\`\`\`bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env.local
\`\`\`

### 개발 서버 실행
\`\`\`bash
npm run dev
\`\`\`

### 프로덕션 빌드
\`\`\`bash
npm run build
npm start
\`\`\`

## 📁 프로젝트 구조
\`\`\`
$ProjectName/
├── app/           # 애플리케이션 코드
├── components/    # 재사용 컴포넌트
├── lib/          # 유틸리티 함수
├── public/       # 정적 파일
├── docs/         # 문서
└── tests/        # 테스트 코드
\`\`\`

## 📝 개발 가이드
[개발 가이드 작성]

## 🧪 테스트
\`\`\`bash
npm test
\`\`\`

## 📦 배포
[배포 가이드 작성]

## 📄 라이선스
[라이선스 정보]
"@ | Out-File -FilePath "README.md" -Encoding UTF8

# GitHub Actions 워크플로우 생성
if ($ProjectType -eq "nextjs" -or $ProjectType -eq "react") {
@"
name: CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Build
      run: npm run build
"@ | Out-File -FilePath ".github/workflows/ci.yml" -Encoding UTF8
}

Write-Host "✅ 프로젝트 생성 완료!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "📁 프로젝트 경로: $ProjectPath" -ForegroundColor Yellow
Write-Host ""
Write-Host "다음 단계:" -ForegroundColor Cyan
Write-Host "1. cd $ProjectName" -ForegroundColor White
Write-Host "2. 환경변수 설정 (.env.local)" -ForegroundColor White
Write-Host "3. npm run dev (개발 서버 시작)" -ForegroundColor White
Write-Host ""
Write-Host "Happy Coding! 🚀" -ForegroundColor Green