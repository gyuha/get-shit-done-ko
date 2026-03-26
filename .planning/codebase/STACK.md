# Technology Stack

**Analysis Date:** 2026-03-26

## Languages

**Primary:**
- JavaScript (CommonJS, Node.js) - 설치기와 CLI 엔진이 `bin/install.js`, `get-shit-done/bin/gsd-tools.cjs`, `get-shit-done/bin/lib/*.cjs`에 구현되어 있습니다.
- Markdown - 워크플로, 에이전트, 스킬, 템플릿이 `README.md`, `agents/*.md`, `commands/gsd/*.md`, `get-shit-done/workflows/*.md`, `get-shit-done/templates/*.md`, `skills/*/SKILL.md`에 저장되어 있습니다.

**Secondary:**
- YAML - CI와 GitHub automation이 `.github/workflows/test.yml`, `.github/workflows/security-scan.yml`, `.github/workflows/auto-label-issues.yml`에 정의되어 있습니다.
- JSON - 패키지/설정 메타데이터가 `package.json`, `package-lock.json`, `.planning/config.json` 생성 로직(`get-shit-done/bin/lib/config.cjs`)에 사용됩니다.
- Shell - 보안 스캔 스크립트와 워크플로 예제가 `scripts/*.sh`, `get-shit-done/workflows/*.md`에 포함됩니다.

## Runtime

**Environment:**
- Node.js `>=20.0.0` - 런타임 요구사항은 `package.json`의 `engines.node`와 `package-lock.json`의 루트 패키지 정의에 명시되어 있습니다.
- 빌드 없이 직접 실행되는 Node CLI 구조입니다. 엔트리포인트는 `bin/install.js`이고 내부 도구 진입점은 `get-shit-done/bin/gsd-tools.cjs`입니다.
- 개발/검증은 macOS, Linux, Windows를 전제로 합니다. 근거는 `README.md`의 설치 안내와 `.github/workflows/test.yml`의 OS 매트릭스입니다.

**Package Manager:**
- npm - 스크립트와 배포 명령은 `package.json`에 정의되어 있습니다.
- Lockfile: `package-lock.json`

## Frameworks

**Core:**
- 별도 웹 프레임워크 없음 - 이 저장소는 Node.js 기반 설치기 + 파일 템플릿/워크플로 배포용 CLI입니다. 근거 파일은 `bin/install.js`, `get-shit-done/bin/gsd-tools.cjs`, `README.md`입니다.

**Testing:**
- Node.js 내장 `node:test` - 테스트 파일이 `tests/*.test.cjs`에서 `require('node:test')`를 사용하고, `scripts/run-tests.cjs`가 `node --test`로 실행합니다.
- `c8` `^11.0.0` - 커버리지 수집은 `package.json`의 `test:coverage`와 lockfile의 `package-lock.json`에 정의되어 있습니다.

**Build/Dev:**
- `esbuild` `^0.24.0` (`package-lock.json` 해상도 `0.24.2`) - hooks 배포 자산 빌드/복사 체인에 포함된 유일한 번들러 의존성입니다. 선언은 `package.json`, 설치 해상도는 `package-lock.json`입니다.
- 커스텀 hook build 스크립트 - `scripts/build-hooks.js`가 `hooks/*.js` 문법을 `vm.Script`로 검증한 뒤 `hooks/dist/*.js`로 복사합니다.

## Key Dependencies

**Critical:**
- Node.js built-ins (`fs`, `path`, `os`, `readline`, `crypto`, `child_process`, `https`) - 설치, 파일 배치, 런타임 감지, GitHub release 조회, 테스트 실행의 핵심이 `bin/install.js`, `get-shit-done/bin/lib/*.cjs`, `scripts/check-upstream-release.cjs`에 구현되어 있습니다.
- `c8` `^11.0.0` - CLI 라이브러리 코드(`get-shit-done/bin/lib/*.cjs`)에 대한 최소 70% 라인 커버리지를 강제합니다. 근거는 `package.json`의 `test:coverage`입니다.
- `esbuild` `^0.24.0` - hook 배포 파이프라인의 빌드 의존성으로 유지됩니다. 선언은 `package.json`, lockfile 해상도는 `package-lock.json`입니다.

**Infrastructure:**
- GitHub Actions 런타임 - 저장소 CI는 `.github/workflows/test.yml`, `.github/workflows/security-scan.yml`, `.github/workflows/auto-label-issues.yml`에 의존합니다.
- npm CLI - 패키지 설치/업데이트/배포 흐름이 `README.md`, `package.json`, `get-shit-done/workflows/update.md`에 결합되어 있습니다.

## Configuration

**Environment:**
- 런타임/설치 위치는 CLI 플래그 `--claude`, `--opencode`, `--gemini`, `--codex`, `--copilot`, `--antigravity`, `--cursor`, `--global`, `--local`로 `bin/install.js`에서 제어합니다.
- 사용자 기본값은 `~/.gsd/defaults.json`을 통해 로드/저장됩니다. 구현은 `get-shit-done/bin/lib/config.cjs`와 `get-shit-done/workflows/settings.md`에 있습니다.
- 선택적 검색 기능은 환경 변수 `BRAVE_API_KEY`, `FIRECRAWL_API_KEY`, `EXA_API_KEY` 또는 대응 키 파일 `~/.gsd/brave_api_key`, `~/.gsd/firecrawl_api_key`, `~/.gsd/exa_api_key`의 존재 여부로 감지됩니다. 감지 로직은 `get-shit-done/bin/lib/config.cjs`와 `get-shit-done/bin/lib/init.cjs`에 있습니다.
- 런타임별 설정 디렉터리 오버라이드는 `CLAUDE_CONFIG_DIR`, `OPENCODE_CONFIG_DIR`, `OPENCODE_CONFIG`, `XDG_CONFIG_HOME`, `GEMINI_CONFIG_DIR`, `CODEX_HOME`, `COPILOT_CONFIG_DIR`, `ANTIGRAVITY_CONFIG_DIR`, `CURSOR_CONFIG_DIR`를 `bin/install.js`에서 해석합니다.

**Build:**
- 패키지 메타데이터와 npm 스크립트는 `package.json`에 있습니다.
- 잠금 파일은 `package-lock.json`입니다.
- hook 빌드 스크립트는 `scripts/build-hooks.js`입니다.
- 테스트 실행 스크립트는 `scripts/run-tests.cjs`입니다.
- CI 구성은 `.github/workflows/test.yml`과 `.github/workflows/security-scan.yml`입니다.

## Platform Requirements

**Development:**
- Node.js 20 이상과 npm이 필요합니다. 근거는 `package.json`과 `README.md`입니다.
- Git 작업과 로컬 파일 시스템 쓰기 권한이 필요합니다. 설치기와 CLI는 `bin/install.js`, `get-shit-done/bin/lib/core.cjs`, `get-shit-done/bin/lib/state.cjs`에서 프로젝트/홈 디렉터리를 직접 수정합니다.
- 다중 플랫폼 호환성이 요구됩니다. `bin/install.js`는 WSL + Windows-native Node 조합을 감지해 차단하고, `.github/workflows/test.yml`은 Ubuntu/macOS/Windows에서 검증합니다.

**Production:**
- 배포 대상은 서버 애플리케이션이 아니라 npm 배포 패키지입니다. 배포 명령은 `package.json`의 `publish:npm`, `release:npm`에 정의되어 있습니다.
- 설치 소비 위치는 각 AI runtime 설정 디렉터리입니다: `.claude`, `.opencode` 또는 `~/.config/opencode`, `.gemini`, `.codex`, `.github`/`~/.copilot`, `.agent`/`~/.gemini/antigravity`, `.cursor`. 경로 결정 로직은 `bin/install.js`와 사용 예시는 `README.md`에 있습니다.

---

*Stack analysis: 2026-03-26*
