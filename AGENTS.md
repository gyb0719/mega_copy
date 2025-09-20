# Repository Guidelines

## Project Structure & Module Organization
- `app/` contains the Next.js App Router routes (`app/admin`, `app/product`, `app/search`), shared UI in `app/components/`, and route helpers in `app/lib/`.
- `lib/` gathers cross-cutting TypeScript utilities (Supabase clients, auth flows, image helpers) importable through the `@/` alias.
- `scripts/` provides backup automation that writes to `backups/` and `logs/`; static assets live in `public/`, while QA fixtures stay in `test/`, `test-runner.cjs`, and `test-images/`.

## Build, Test, and Development Commands
- `npm run dev` — start the development server on http://localhost:3004.
- `npm run build` — create the production bundle used by deployments.
- `npm run start` — serve the compiled app on port 3004 for verification.
- `npm run lint` — run Next.js ESLint defaults; resolve failures before committing.
- `node test-runner.cjs` — guided upload/compression regression test that saves `test-results.json`.
- `npm run backup:download|backup:upload|backup:status` — run the backup workflow maintained in `scripts/`.

## Coding Style & Naming Conventions
- Strict TypeScript is enforced; prefer explicit return types and strongly typed Zustand stores in `lib/stores`.
- Use two-space indentation and group Tailwind utilities logically (layout → spacing → state) for readability.
- Components and hooks use `PascalCase`; helpers and stores use `camelCase`; route folders remain `kebab-case` to mirror URLs.
- Favor the `@/` alias over deep relative paths to keep module boundaries legible.

## Testing Guidelines
- Start `npm run dev` before `node test-runner.cjs`; follow prompts, confirm PASS, and commit `test-results.json` only when green.
- Extend automation in `test/` with async helpers (`runUploadTests`) and record manual expectations in comments for future tooling.
- Keep lightweight fixtures in `test-images/`; document generation steps instead of committing large binaries.

## Commit & Pull Request Guidelines
- Follow Conventional Commits (`feat:`, `fix:`, `docs:`) from history; keep subjects imperative and within 72 characters.
- PRs must summarize scope, link related issues, flag backup or schema changes, and attach QA proof (console capture or `test-results.json` diff).
- Include a checklist covering dev server verification, lint status, and test-runner completion to speed reviews.

## Security & Ops Notes
- Supply Supabase and Google Drive credentials through environment variables consumed by `scripts/backup-config.js`; never commit production secrets.
- Review artifacts generated in `backups/` and `logs/` before pushing and honor the 90-day retention defined in the backup config.

## Communication
- 모든 이슈, PR 설명, 코드 리뷰 코멘트는 반드시 한국어로 작성하세요.
