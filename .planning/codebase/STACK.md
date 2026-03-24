# Technology Stack

**Analysis Date:** 2026-03-24

## Languages

**Primary:**
- JavaScript (CommonJS, Node.js 20+) - 설치기, CLI 도구, 훅, 테스트 구현 (`bin/install.js`, `get-shit-done/bin/gsd-tools.cjs`, `hooks/*.js`, `tests/*.test.cjs`)
- Markdown - 명령, 워크플로, 에이전트, 템플릿, 사용자 문서 (`commands/gsd/*.md`, `get-shit-done/workflows/*.md`, `agents/*.md`, `docs/*.md`)

**Secondary:**
- JSON - 패키지/설정 메타데이터 (`package.json`, `.claude/settings.json`, `.opencode/opencode.json`)
- Shell snippets - 문서와 워크플로 안의 실행 예시 (`README.md`, `get-shit-done/workflows/*.md`)

## Runtime

**Environment:**
- Node.js `>=20.0.0` (`package.json`)
- 로컬 파일 시스템 접근 필요. 설치기는 사용자 홈 디렉터리와 프로젝트 루트에 런타임별 자산을 배치함 (`bin/install.js`)

**Package Manager:**
- npm
- Lockfile: `package-lock.json`

## Frameworks

**Core:**
- 별도 웹 프레임워크 없음 - Node.js 기반 CLI + 문서/프롬프트 자산 저장소
- GSD workflow system - Markdown 워크플로와 에이전트 정의를 런타임 자산으로 제공 (`get-shit-done/workflows/`, `agents/`)

**Testing:**
- Node.js built-in `node:test` - 회귀 테스트 스위트 (`tests/*.test.cjs`)
- `node:assert` - assertion 라이브러리 (`tests/dispatcher.test.cjs`)
- `c8` - 커버리지 측정 (`package.json`)

**Build/Dev:**
- `esbuild` - 훅 번들링 (`package.json`, `scripts/build-hooks.js`)
- 커스텀 test runner - 플랫폼 간 테스트 실행 통일 (`scripts/run-tests.cjs`)

## Key Dependencies

**Critical:**
- `esbuild` - `hooks/*.js`를 `hooks/dist/`로 빌드해 배포 가능 상태를 만듦 (`package.json`, `scripts/build-hooks.js`)
- `c8` - `get-shit-done/bin/lib/*.cjs` 커버리지 게이트를 검증함 (`package.json`)
- Node.js built-ins `fs`, `path`, `os`, `readline`, `crypto`, `child_process` - 설치기와 CLI 도구의 핵심 기반 (`bin/install.js`, `get-shit-done/bin/lib/*.cjs`)

**Infrastructure:**
- npm publishing - 패키지 배포 흐름 (`package.json`의 `publish:npm`, `release:npm`)
- GitHub repository metadata - 배포/이슈/홈페이지 연결 (`package.json`)

## Configuration

**Environment:**
- 프로젝트 계획 상태는 `.planning/`에 저장됨. 초기화 후 `PROJECT.md`, `REQUIREMENTS.md`, `ROADMAP.md`, `STATE.md`, `config.json`이 생성됨 (`README.md`, `get-shit-done/bin/lib/init.cjs`)
- 일부 선택 기능은 API 키 또는 홈 디렉터리 파일에 의존함: `BRAVE_API_KEY`, `FIRECRAWL_API_KEY`, `EXA_API_KEY`, 또는 `~/.gsd/*_api_key` (`get-shit-done/bin/lib/init.cjs`, `get-shit-done/bin/lib/config.cjs`)
- 런타임별 설치 대상 디렉터리는 `.claude/`, `.codex/`, `.opencode/`, `.github/`, `.cursor/`, `.agent/`, `~/.gemini/` 계열을 사용함 (`bin/install.js`)

**Build:**
- `package.json` - 엔진, scripts, publish 설정
- `scripts/build-hooks.js` - 훅 빌드
- `scripts/run-tests.cjs` - 테스트 실행 엔트리

## Platform Requirements

**Development:**
- macOS, Linux, Windows 지원을 전제로 함 (`README.md`)
- WSL에서 Windows-native Node.js는 지원하지 않으며 설치기가 명시적으로 차단함 (`bin/install.js`)

**Production:**
- npm 패키지로 배포되는 로컬 개발 도구
- 호스트 런타임은 Claude Code, OpenCode, Gemini CLI, Codex, Copilot, Cursor, Antigravity를 지원함 (`README.md`)

---
*Stack analysis: 2026-03-24*
*Update after major dependency changes*
