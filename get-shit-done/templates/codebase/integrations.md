# External Integrations Template

> 한국어 우선 안내: 이 템플릿은 `.planning/codebase/INTEGRATIONS.md`를 한국어로 정리하기 위한 기준입니다.

Template for `.planning/codebase/INTEGRATIONS.md` - captures external service dependencies.

**Purpose:** 이 코드베이스가 외부 서비스, 저장소, 인증, 배포 환경과 어떻게 연결되는지 정리합니다.

---

## File Template

```markdown
# External Integrations

**Analysis Date:** [YYYY-MM-DD]

## APIs & External Services

**[Integration Type]:**
- [서비스] - [사용 목적]
  - SDK/Client: [사용 라이브러리]
  - Auth: [인증 방식]
  - Endpoints used: [주요 엔드포인트]

## Data Storage

**Databases:**
- [저장소] - [용도]
  - Connection: [연결 방식]
  - Client: [클라이언트]

**File Storage:**
- [스토리지] - [용도]

## Authentication & Identity

**Auth Provider:**
- [서비스] - [용도]
  - Implementation: [구현 방식]
  - Token storage: [토큰 저장 방식]

## Monitoring & Observability

**Error Tracking:**
- [서비스] - [용도]

**Logs:**
- [서비스] - [수집 방식]

## CI/CD & Deployment

**Hosting:**
- [플랫폼] - [배포 방식]

**CI Pipeline:**
- [서비스] - [역할]

## Local Tooling / Human Dependencies

- [사람이 직접 설정해야 하는 외부 요소]

---
*Integration analysis: [date]*
*Update when external dependencies change*
```

<good_examples>

```markdown
# External Integrations

**Analysis Date:** 2026-03-24

## APIs & External Services

**Package Registry:**
- npm - 패키지 배포와 설치
  - SDK/Client: npm CLI
  - Auth: maintainer npm credentials
  - Endpoints used: package publish/install

**Git Hosting:**
- GitHub - 소스 저장소, releases, issue/PR 관리
  - SDK/Client: git / gh / 웹 UI
  - Auth: git credentials or GitHub token

## Data Storage

**Databases:**
- 별도 애플리케이션 DB 없음 - 상태는 주로 파일로 관리

**File Storage:**
- 로컬 파일 시스템 - `.planning/`, `.codex/`, `skills/`

## Authentication & Identity

**Auth Provider:**
- 없음 - 일반 사용자 인증 기능이 아닌 로컬 tooling 저장소

## CI/CD & Deployment

**Hosting:**
- 로컬 설치형 사용 + GitHub 저장소 배포

**CI Pipeline:**
- 로컬 테스트 스크립트 중심, 필요 시 GitHub Actions 확장 가능
```

</good_examples>

<guidelines>

- "우리 코드 밖에 있는 의존성"만 적습니다.
- 환경 변수, 대시보드 설정, 사람 손이 필요한 절차도 함께 적습니다.
- 코드 내부 모듈 의존성은 ARCHITECTURE.md나 STRUCTURE.md로 분리합니다.

</guidelines>
