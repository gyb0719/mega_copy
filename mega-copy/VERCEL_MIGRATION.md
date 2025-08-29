# 🚀 Vercel로 긴급 배포 (5분 안에 완료)

## 1. Vercel 가입 및 프로젝트 연결
1. https://vercel.com 접속
2. "Sign up with GitHub" 클릭
3. GitHub 계정으로 로그인

## 2. 프로젝트 Import
1. "Import Git Repository" 클릭
2. `gyb0719/mega_copy` 선택
3. "Import" 클릭

## 3. 환경변수 설정
Environment Variables에 추가:
```
NEXT_PUBLIC_SUPABASE_URL = https://nzmscqfrmxqcukhshsok.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56bXNjcWZybXhxY3VraHNoc29rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMTg1NDMsImV4cCI6MjA3MTc5NDU0M30.o0zQtPEjsuJnfQnY2MiakuM2EvTlVuRO9yeoajrwiLU
```

## 4. Deploy 클릭
- 자동으로 빌드 시작
- 2-3분 내 완료

## 5. 도메인 연결
1. Settings → Domains
2. "Add Domain" 클릭
3. `megacopy.shop` 입력
4. DNS 설정:
   - Type: CNAME
   - Name: @
   - Value: cname.vercel-dns.com

## 완료!
- Vercel URL로 즉시 접속 가능
- 도메인은 DNS 전파 후 작동 (최대 48시간)