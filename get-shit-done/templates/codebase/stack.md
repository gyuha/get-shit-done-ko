# Technology Stack Template

> 한국어 우선 안내: 이 템플릿은 `.planning/codebase/STACK.md`를 한국어로 채우기 위한 기준 문서입니다.

Template for `.planning/codebase/STACK.md` - captures the technology foundation.

**Purpose:** 실행 시 실제로 동작하는 기술 스택과 버전, 런타임 제약을 짧고 명확하게 기록합니다.

---

## File Template

```markdown
# Technology Stack

**Analysis Date:** [YYYY-MM-DD]

## Languages

**Primary:**
- [언어] [버전] - [주 사용 위치]

**Secondary:**
- [언어] [버전] - [보조 사용 위치]

## Runtime

**Environment:**
- [런타임] [버전]
- [추가 실행 조건]

**Package Manager:**
- [패키지 매니저] [버전]
- Lockfile: [예: package-lock.json]

## Frameworks

**Core:**
- [프레임워크] [버전] - [역할]

**Testing:**
- [도구] [버전] - [역할]

**Build/Dev:**
- [도구] [버전] - [역할]

## Key Dependencies

**Critical:**
- [패키지] [버전] - [중요한 이유]
- [패키지] [버전] - [중요한 이유]

**Infrastructure:**
- [패키지] [버전] - [기반 역할]

## Configuration

**Environment:**
- [설정 방식]
- [필수 환경 변수 또는 설정 파일]

**Build:**
- [빌드 관련 설정 파일]

## Platform Requirements

**Development:**
- [개발 환경 요구사항]

**Production:**
- [배포 대상]
- [운영 버전 조건]

---
*Stack analysis: [date]*
*Update after major dependency changes*
```

<good_examples>

```markdown
# Technology Stack

**Analysis Date:** 2026-03-24

## Languages

**Primary:**
- JavaScript (CommonJS) - CLI 런타임과 테스트 코드
- Markdown - 스킬, 워크플로, 템플릿 문서

**Secondary:**
- JSON - 패키지/설정 메타데이터
- Shell - 설치 및 검증 보조 명령

## Runtime

**Environment:**
- Node.js 20.x 이상
- 로컬 파일 시스템 접근 필요

**Package Manager:**
- npm 10.x
- Lockfile: `package-lock.json`

## Frameworks

**Core:**
- 별도 웹 프레임워크 없음 - Node.js 기반 CLI/문서 시스템

**Testing:**
- Node.js 내장 `node:test` - 단위/통합 테스트

**Build/Dev:**
- 별도 빌드 단계 최소화
- `npx` 설치 흐름 지원

## Key Dependencies

**Critical:**
- `gray-matter` - frontmatter 파싱
- `glob` - 파일 탐색
- `minimist` - CLI 옵션 파싱

**Infrastructure:**
- Node.js built-ins - `fs`, `path`, `child_process`

## Configuration

**Environment:**
- `.planning/config.json`
- 일부 기능은 로컬 API 키 파일 또는 환경 변수 사용

**Build:**
- `package.json`
- `scripts/run-tests.cjs`

## Platform Requirements

**Development:**
- macOS / Linux / Windows + Node.js

**Production:**
- 로컬 개발 환경 또는 설치된 Codex/Claude runtime
```

</good_examples>

<guidelines>

- 모든 dependency를 나열하지 말고, 이해에 필요한 핵심만 적습니다.
- 버전이 중요한 경우에만 구체 버전을 남깁니다.
- STRUCTURE.md에 들어갈 파일 경로 설명은 여기로 가져오지 않습니다.
- ARCHITECTURE.md에 들어갈 설계 패턴 설명도 분리합니다.

</guidelines>
