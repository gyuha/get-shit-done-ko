# External Integrations

**Analysis Date:** 2026-03-24

## APIs & External Services

**Git Hosting / Releases:**
- GitHub - 소스 저장소, 릴리스 확인, 이슈/문서 링크
  - SDK/Client: `git`, GitHub HTTPS endpoints, 사용자 브라우저
  - Auth: 로컬 git credential 또는 GitHub token
  - Endpoints used: `https://api.github.com/repos/.../releases/latest` (`scripts/check-upstream-release.cjs`)

**Package Registry:**
- npm - 설치 및 배포 대상
  - SDK/Client: npm CLI
  - Auth: maintainer npm credentials
  - Endpoints used: `npm publish`, `npm pack` (`package.json`)

**Optional Search Providers:**
- Brave Search - 일부 워크플로에서 웹 검색 기능 제공
  - SDK/Client: built-in `fetch` from Node.js (`get-shit-done/bin/lib/commands.cjs`)
  - Auth: `BRAVE_API_KEY` 또는 `~/.gsd/brave_api_key`
  - Endpoints used: `https://api.search.brave.com/res/v1/web/search`
- Firecrawl / Exa - 프로젝트 초기화 및 리서치 capability detection 용도
  - SDK/Client: 런타임 감지 중심
  - Auth: `FIRECRAWL_API_KEY`, `EXA_API_KEY` 또는 `~/.gsd/*_api_key`
  - Endpoints used: codebase에는 감지만 있고 직접 호출은 워크플로/다른 런타임에서 수행

## Data Storage

**Databases:**
- Not detected - 애플리케이션 DB는 없음

**File Storage:**
- 로컬 파일 시스템 - 계획 상태와 런타임 자산 저장
  - `.planning/` - 프로젝트 상태
  - `get-shit-done/` - source-of-truth workflow/template assets
  - `.claude/`, `.codex/`, `.opencode/`, `.github/`, `.cursor/`, `.agent/` - 런타임별 설치 산출물

## Authentication & Identity

**Auth Provider:**
- 별도 사용자 인증 시스템 없음
- 유지보수 작업은 외부 서비스 자격 증명에 의존
  - GitHub: upstream release 확인, 저장소 운영
  - npm: package publish
  - Brave/Firecrawl/Exa: optional research/search features

## Monitoring & Observability

**Error Tracking:**
- 별도 외부 에러 추적 서비스는 감지되지 않음

**Logs:**
- 주로 CLI stdout/stderr와 테스트 결과에 의존 (`get-shit-done/bin/gsd-tools.cjs`, `scripts/run-tests.cjs`)

## CI/CD & Deployment

**Hosting:**
- npm registry를 통한 패키지 배포 (`package.json`)
- GitHub 저장소를 통한 소스 배포와 릴리스 기준선 관리 (`docs/UPSTREAM-SYNC.md`)

**CI Pipeline:**
- 저장소에는 `.github/workflows/`가 있으나 이 분석에서는 개별 workflow 파일까지 세부 검토하지 않았음
- 로컬 canonical validation 경로는 `node scripts/run-tests.cjs`와 `node get-shit-done/bin/gsd-tools.cjs validate ...` 조합임 (`docs/UPSTREAM-SYNC.md`)

## Local Tooling / Human Dependencies

- 유지보수자는 upstream 동기화 시 `scripts/check-upstream-release.cjs`와 `scripts/apply-upstream-refresh.cjs`를 수동 실행해야 함 (`docs/UPSTREAM-SYNC.md`)
- 런타임 설치는 사용자가 대상 에이전트와 설치 위치를 선택해야 함 (`README.md`, `bin/install.js`)
- Codex/Copilot/Claude/OpenCode별 설정 파일과 generated block은 설치기가 소유함. 수동 편집 시 마커를 보존해야 함 (`bin/install.js`)

---
*Integration analysis: 2026-03-24*
*Update when external dependencies change*
