# External Integrations

**Analysis Date:** 2026-03-26

## APIs & External Services

**Package Registry / Package Distribution:**
- npm - 설치, 업데이트 확인, 공개 배포에 사용됩니다.
  - SDK/Client: npm CLI (`package.json`, `README.md`, `get-shit-done/workflows/update.md`, `hooks/gsd-check-update.js`)
  - Auth: maintainer npm credentials for `npm publish --access public` in `package.json`
  - Endpoints used: npm registry metadata via `npm view get-shit-done-ko version` in `get-shit-done/workflows/update.md`; publish/install via `npm publish`, `npm pack`, `npx get-shit-done-ko@latest` in `package.json` and `README.md`

**Git Hosting / Release Source:**
- GitHub - 소스 저장소, 릴리스 원본, issue/discussion 진입점, CI 호스팅에 사용됩니다.
  - SDK/Client: git/GitHub Actions/API (`package.json`, `.github/workflows/*.yml`, `scripts/check-upstream-release.cjs`)
  - Auth: git credentials or GitHub token; Actions는 GitHub-hosted runner context 사용
  - Endpoints used: `https://api.github.com/repos/gsd-build/get-shit-done/releases/latest` in `scripts/check-upstream-release.cjs`; 저장소 URL은 `package.json`, `README.md`, `.github/ISSUE_TEMPLATE/config.yml`

**Search API (optional runtime feature):**
- Brave Search API - 선택적 웹 검색 백엔드입니다. 키가 없으면 기능이 비활성화됩니다.
  - SDK/Client: native `fetch` in `get-shit-done/bin/lib/commands.cjs`
  - Auth: `BRAVE_API_KEY` env var, 또는 키 존재 여부 감지는 `get-shit-done/bin/lib/config.cjs`, `get-shit-done/bin/lib/init.cjs`
  - Endpoints used: `https://api.search.brave.com/res/v1/web/search` in `get-shit-done/bin/lib/commands.cjs`

**Research Provider Flags (capability detection only):**
- Firecrawl - 현재 저장소에는 직접 호출 클라이언트가 없고, 사용 가능 여부만 감지합니다.
  - SDK/Client: Not detected in executable client code; availability flags only in `get-shit-done/bin/lib/config.cjs` and `get-shit-done/bin/lib/init.cjs`
  - Auth: `FIRECRAWL_API_KEY` env var or `~/.gsd/firecrawl_api_key`
  - Endpoints used: Not detected
- Exa - 현재 저장소에는 직접 호출 클라이언트가 없고, 사용 가능 여부만 감지합니다.
  - SDK/Client: Not detected in executable client code; availability flags only in `get-shit-done/bin/lib/config.cjs` and `get-shit-done/bin/lib/init.cjs`
  - Auth: `EXA_API_KEY` env var or `~/.gsd/exa_api_key`
  - Endpoints used: Not detected

**Community / Support:**
- Discord - 커뮤니티 안내 링크로만 노출됩니다.
  - SDK/Client: direct URL output in `bin/install.js`, `.github/ISSUE_TEMPLATE/config.yml`, `README.md`
  - Auth: Discord account handled outside this repo
  - Endpoints used: `https://discord.gg/gsd`

## Data Storage

**Databases:**
- Not detected - 애플리케이션 데이터베이스, ORM, SQL/NoSQL 클라이언트 의존성은 `package.json`과 `get-shit-done/bin/lib/*.cjs`에서 확인되지 않습니다.

**File Storage:**
- 로컬 파일 시스템 - 설치 산출물과 상태를 로컬 디렉터리에 씁니다.
  - Connection: Node.js `fs` through `bin/install.js`, `get-shit-done/bin/lib/core.cjs`, `get-shit-done/bin/lib/state.cjs`
  - Client: Node.js built-in `fs`
- 사용자 홈 기반 설정 저장소 - `~/.claude`, `~/.config/opencode`, `~/.opencode`, `~/.gemini`, `~/.codex`, `~/.copilot`, `~/.gemini/antigravity`, `~/.cursor`, `~/.gsd`를 `bin/install.js`, `hooks/gsd-check-update.js`, `get-shit-done/bin/lib/config.cjs`가 사용합니다.

**Caching:**
- 로컬 JSON 캐시 - 업데이트 확인 결과를 runtime cache 디렉터리의 `gsd-update-check.json`에 저장합니다. 구현은 `hooks/gsd-check-update.js`, 캐시 정리는 `get-shit-done/workflows/update.md`입니다.

## Authentication & Identity

**Auth Provider:**
- 별도 사용자 인증 제공자 없음 - 이 저장소는 로컬 개발 도구 패키지이며 앱 사용자 로그인 시스템을 포함하지 않습니다. 근거는 `package.json`, `bin/install.js`, `get-shit-done/bin/lib/*.cjs` 전반입니다.
  - Implementation: 런타임/서비스별 토큰은 각 외부 서비스가 담당하고, 저장소는 환경 변수 또는 홈 디렉터리 키 파일 존재 여부만 확인합니다 (`get-shit-done/bin/lib/config.cjs`, `get-shit-done/bin/lib/init.cjs`)
  - Token storage: `process.env.*` 또는 `~/.gsd/*_api_key`; 실제 값은 저장소에 커밋되지 않습니다.

## Monitoring & Observability

**Error Tracking:**
- 전용 외부 에러 추적 서비스는 Not detected - Sentry, Datadog, Rollbar 같은 SDK는 `package.json`과 코드베이스에서 확인되지 않습니다.

**Logs:**
- 로컬 콘솔/파일 기반 로깅 - 설치기와 스크립트는 stdout/stderr를 사용하고, hooks는 로컬 캐시/상태 파일을 기록합니다. 구현은 `bin/install.js`, `scripts/build-hooks.js`, `hooks/gsd-check-update.js`, `hooks/gsd-context-monitor.js`, `hooks/gsd-statusline.js`입니다.

## CI/CD & Deployment

**Hosting:**
- npm package distribution + GitHub repository hosting - 배포 패키지는 npm, 소스와 자동화는 GitHub에 있습니다. 근거는 `package.json`, `README.md`, `.github/workflows/*.yml`입니다.

**CI Pipeline:**
- GitHub Actions - 테스트와 보안 스캔, 이슈 라벨링 자동화를 담당합니다.
  - Tests: `.github/workflows/test.yml`
  - Security scan: `.github/workflows/security-scan.yml`
  - Issue triage automation: `.github/workflows/auto-label-issues.yml`

## Environment Configuration

**Required env vars:**
- `BRAVE_API_KEY` - Brave Search API 사용 시 필요. 구현은 `get-shit-done/bin/lib/commands.cjs`, 감지는 `get-shit-done/bin/lib/config.cjs`
- `FIRECRAWL_API_KEY` - Firecrawl capability 감지용. 구현은 `get-shit-done/bin/lib/config.cjs`, `get-shit-done/bin/lib/init.cjs`
- `EXA_API_KEY` - Exa capability 감지용. 구현은 `get-shit-done/bin/lib/config.cjs`, `get-shit-done/bin/lib/init.cjs`
- `CLAUDE_CONFIG_DIR`, `OPENCODE_CONFIG_DIR`, `OPENCODE_CONFIG`, `XDG_CONFIG_HOME`, `GEMINI_CONFIG_DIR`, `CODEX_HOME`, `COPILOT_CONFIG_DIR`, `ANTIGRAVITY_CONFIG_DIR`, `CURSOR_CONFIG_DIR` - runtime 설치 위치 해석용. 구현은 `bin/install.js`

**Secrets location:**
- 환경 변수 또는 `~/.gsd/brave_api_key`, `~/.gsd/firecrawl_api_key`, `~/.gsd/exa_api_key` 같은 홈 디렉터리 파일 경로만 사용합니다. 경로 참조는 `get-shit-done/bin/lib/config.cjs`와 `get-shit-done/bin/lib/init.cjs`에 있습니다.

## Webhooks & Callbacks

**Incoming:**
- GitHub webhook-equivalent events via Actions - `pull_request`, `push`, `workflow_dispatch`, `issues` 이벤트를 `.github/workflows/test.yml`, `.github/workflows/security-scan.yml`, `.github/workflows/auto-label-issues.yml`가 수신합니다.

**Outgoing:**
- GitHub REST API call for release checks - `scripts/check-upstream-release.cjs`가 `https://api.github.com/repos/gsd-build/get-shit-done/releases/latest`로 요청합니다.
- Brave Search API call - `get-shit-done/bin/lib/commands.cjs`가 Brave Search 엔드포인트로 요청합니다.
- npm registry queries - `get-shit-done/workflows/update.md`와 `hooks/gsd-check-update.js`가 `npm view ... version`을 호출합니다.

---

*Integration audit: 2026-03-26*
