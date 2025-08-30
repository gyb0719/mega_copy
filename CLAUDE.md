# Claude Code 프로젝트 설정

## 🚫 커밋 서명 절대 금지

### 핵심 규칙
**절대 Claude 서명, 이모지, Co-Authored-By를 추가하지 마세요**

### 자연어 커밋 규칙
사용자가 커밋 요청 시:
- 서명 없이 깔끔한 메시지로만 커밋
- 추가 텍스트 절대 금지
- 간결한 conventional commit 형식만 사용

### 예시
- "커밋해줘" → `git commit -m "Update"`
- "로그인 추가 커밋" → `git commit -m "feat: add login"`
- "버그 수정 커밋" → `git commit -m "fix: resolve bug"`

### 커밋 메시지 형식
```
type: description
```
- 🤖 이모지나 Claude 서명을 추가하지 마세요
- Co-Authored-By 라인을 추가하지 마세요

### 작업 방식
1. 코드 수정 시: 변경사항만 적용
2. 커밋 요청 시: "커밋은 직접 하시는 것을 추천합니다" 안내
3. 필수 커밋 시: 최소한의 메시지만 사용

### 예시
```bash
# 좋은 예
feat: add dark mode
fix: resolve login issue

# 피해야 할 예
feat: add dark mode 🤖 Generated with Claude Code
fix: resolve login issue

Co-Authored-By: Claude <noreply@anthropic.com>
```

## 코드 스타일
- 주석 최소화
- 간결한 변수명 사용
- 불필요한 콘솔 로그 제거

## Git 작업
- 커밋보다는 코드 수정에 집중
- 사용자가 명시적으로 요청할 때만 커밋
- push는 항상 사용자 확인 후 진행