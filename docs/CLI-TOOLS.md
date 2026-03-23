# GSD CLI 도구 레퍼런스

> `gsd-tools.cjs`의 프로그래매틱 API 레퍼런스입니다. 주로 워크플로와 에이전트가 내부적으로 사용하며, 사용자용 명령어는 [Command Reference](COMMANDS.md)를 참고하세요.

> [!NOTE]
> CLI 서브커맨드, 인자, 파일 경로는 그대로 유지하고 설명만 한국어로 안내합니다.

---

## 개요

`gsd-tools.cjs`는 GSD의 수십 개 명령어, 워크플로, 에이전트 파일에서 반복되던 인라인 bash 패턴을 치환하는 Node.js CLI 유틸리티입니다. config 파싱, 모델 해석, phase 조회, git commit, summary 검증, state 관리, template 작업을 한곳으로 모아 둡니다.

**위치:** `get-shit-done/bin/gsd-tools.cjs`
**모듈:** `get-shit-done/bin/lib/` 아래 15개 도메인 모듈

**사용법:**
```bash
node gsd-tools.cjs <command> [args] [--raw] [--cwd <path>]
```

**전역 Flag:**
| Flag | 설명 |
|------|------|
| `--raw` | 기계 판독용 출력(JSON 또는 일반 텍스트, 서식 없음) |
| `--cwd <path>` | 작업 디렉터리 override(샌드박스 서브에이전트용) |

---

## State 명령

프로젝트의 살아 있는 메모리인 `.planning/STATE.md`를 다룹니다.

```bash
# Load full project config + state as JSON
node gsd-tools.cjs state load

# Output STATE.md frontmatter as JSON
node gsd-tools.cjs state json

# Update a single field
node gsd-tools.cjs state update <field> <value>

# Get STATE.md content or a specific section
node gsd-tools.cjs state get [section]

# Batch update multiple fields
node gsd-tools.cjs state patch --field1 val1 --field2 val2

# Increment plan counter
node gsd-tools.cjs state advance-plan

# Record execution metrics
node gsd-tools.cjs state record-metric --phase N --plan M --duration Xmin [--tasks N] [--files N]

# Recalculate progress bar
node gsd-tools.cjs state update-progress

# Add a decision
node gsd-tools.cjs state add-decision --summary "..." [--phase N] [--rationale "..."]
# Or from files:
node gsd-tools.cjs state add-decision --summary-file path [--rationale-file path]

# Add/resolve blockers
node gsd-tools.cjs state add-blocker --text "..."
node gsd-tools.cjs state resolve-blocker --text "..."

# Record session continuity
node gsd-tools.cjs state record-session --stopped-at "..." [--resume-file path]
```

### State 스냅샷

전체 `STATE.md`를 구조적으로 파싱합니다.

```bash
node gsd-tools.cjs state-snapshot
```

반환 JSON에는 현재 위치, phase, plan, 상태, 결정, blocker, 메트릭, 마지막 활동이 들어 있습니다.

---

## Phase 명령

phase 디렉터리, 번호, roadmap 동기화를 관리합니다.

```bash
# Find phase directory by number
node gsd-tools.cjs find-phase <phase>

# Calculate next decimal phase number for insertions
node gsd-tools.cjs phase next-decimal <phase>

# Append new phase to roadmap + create directory
node gsd-tools.cjs phase add <description>

# Insert decimal phase after existing
node gsd-tools.cjs phase insert <after> <description>

# Remove phase, renumber subsequent
node gsd-tools.cjs phase remove <phase> [--force]

# Mark phase complete, update state + roadmap
node gsd-tools.cjs phase complete <phase>

# Index plans with waves and status
node gsd-tools.cjs phase-plan-index <phase>

# List phases with filtering
node gsd-tools.cjs phases list [--type planned|executed|all] [--phase N] [--include-archived]
```

---

## Roadmap 명령

`ROADMAP.md`를 파싱하고 갱신합니다.

```bash
# Extract phase section from ROADMAP.md
node gsd-tools.cjs roadmap get-phase <phase>

# Full roadmap parse with disk status
node gsd-tools.cjs roadmap analyze

# Update progress table row from disk
node gsd-tools.cjs roadmap update-plan-progress <N>
```

---

## Config 명령

`.planning/config.json`을 읽고 씁니다.

```bash
# Initialize config.json with defaults
node gsd-tools.cjs config-ensure-section

# Set a config value (dot notation)
node gsd-tools.cjs config-set <key> <value>

# Get a config value
node gsd-tools.cjs config-get <key>

# Set model profile
node gsd-tools.cjs config-set-model-profile <profile>
```

---

## 모델 해석

```bash
# 현재 profile 기준으로 에이전트 모델 조회
node gsd-tools.cjs resolve-model <agent-name>
# 반환값: opus | sonnet | haiku | inherit
```

에이전트 이름: `gsd-planner`, `gsd-executor`, `gsd-phase-researcher`, `gsd-project-researcher`, `gsd-research-synthesizer`, `gsd-verifier`, `gsd-plan-checker`, `gsd-integration-checker`, `gsd-roadmapper`, `gsd-debugger`, `gsd-codebase-mapper`, `gsd-nyquist-auditor`

---

## 검증 명령

plan, phase, reference, commit을 검증합니다.

```bash
# Verify SUMMARY.md file
node gsd-tools.cjs verify-summary <path> [--check-count N]

# Check PLAN.md structure + tasks
node gsd-tools.cjs verify plan-structure <file>

# Check all plans have summaries
node gsd-tools.cjs verify phase-completeness <phase>

# Check @-refs + paths resolve
node gsd-tools.cjs verify references <file>

# Batch verify commit hashes
node gsd-tools.cjs verify commits <hash1> [hash2] ...

# Check must_haves.artifacts
node gsd-tools.cjs verify artifacts <plan-file>

# Check must_haves.key_links
node gsd-tools.cjs verify key-links <plan-file>
```

---

## 무결성 검사 명령

프로젝트 무결성을 점검합니다.

```bash
# Check phase numbering, disk/roadmap sync
node gsd-tools.cjs validate consistency

# Check .planning/ integrity, optionally repair
node gsd-tools.cjs validate health [--repair]
```

---

## 템플릿 명령

템플릿 선택과 치환을 수행합니다.

```bash
# Select summary template based on granularity
node gsd-tools.cjs template select <type>

# Fill template with variables
node gsd-tools.cjs template fill <type> --phase N [--plan M] [--name "..."] [--type execute|tdd] [--wave N] [--fields '{json}']
```

`fill`에서 사용할 수 있는 템플릿 유형: `summary`, `plan`, `verification`

---

## Frontmatter 명령

임의의 Markdown 파일에서 YAML frontmatter CRUD 작업을 수행합니다.

```bash
# Extract frontmatter as JSON
node gsd-tools.cjs frontmatter get <file> [--field key]

# Update single field
node gsd-tools.cjs frontmatter set <file> --field key --value jsonVal

# Merge JSON into frontmatter
node gsd-tools.cjs frontmatter merge <file> --data '{json}'

# Validate required fields
node gsd-tools.cjs frontmatter validate <file> --schema plan|summary|verification
```

---

## Scaffold 명령

미리 구조화된 파일과 디렉터리를 만듭니다.

```bash
# Create CONTEXT.md template
node gsd-tools.cjs scaffold context --phase N

# Create UAT.md template
node gsd-tools.cjs scaffold uat --phase N

# Create VERIFICATION.md template
node gsd-tools.cjs scaffold verification --phase N

# Create phase directory
node gsd-tools.cjs scaffold phase-dir --phase N --name "phase name"
```

---

## Init 명령(복합 컨텍스트 로딩)

특정 워크플로에 필요한 모든 컨텍스트를 한 번에 불러옵니다. 프로젝트 정보, config, state, 워크플로별 데이터를 담은 JSON을 반환합니다.

```bash
node gsd-tools.cjs init execute-phase <phase>
node gsd-tools.cjs init plan-phase <phase>
node gsd-tools.cjs init new-project
node gsd-tools.cjs init new-milestone
node gsd-tools.cjs init quick <description>
node gsd-tools.cjs init resume
node gsd-tools.cjs init verify-work <phase>
node gsd-tools.cjs init phase-op <phase>
node gsd-tools.cjs init todos [area]
node gsd-tools.cjs init milestone-op
node gsd-tools.cjs init map-codebase
node gsd-tools.cjs init progress
```

**대용량 payload 처리:** 출력이 약 50KB를 넘으면 CLI는 임시 파일에 기록하고 `@file:/tmp/gsd-init-XXXXX.json`을 반환합니다. 워크플로는 `@file:` 접두사를 확인해 디스크에서 읽습니다.

```bash
INIT=$(node gsd-tools.cjs init execute-phase "1")
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

---

## Milestone 명령

```bash
# Archive milestone
node gsd-tools.cjs milestone complete <version> [--name <name>] [--archive-phases]

# Mark requirements as complete
node gsd-tools.cjs requirements mark-complete <ids>
# Accepts: REQ-01,REQ-02 or REQ-01 REQ-02 or [REQ-01, REQ-02]
```

---

## 유틸리티 명령

```bash
# 텍스트를 URL 안전 slug로 변환
node gsd-tools.cjs generate-slug "Some Text Here"
# → some-text-here

# 타임스탬프 얻기
node gsd-tools.cjs current-timestamp [full|date|filename]

# 대기 중인 todo 개수와 목록 조회
node gsd-tools.cjs list-todos [area]

# 파일/디렉터리 존재 여부 확인
node gsd-tools.cjs verify-path-exists <path>

# 모든 SUMMARY.md 데이터 집계
node gsd-tools.cjs history-digest

# SUMMARY.md에서 구조화된 데이터 추출
node gsd-tools.cjs summary-extract <path> [--fields field1,field2]

# 프로젝트 통계
node gsd-tools.cjs stats [json|table]

# 진행 상태 렌더링
node gsd-tools.cjs progress [json|table|bar]

# todo 완료 처리
node gsd-tools.cjs todo complete <filename>

# UAT audit — 모든 phase에서 미해결 항목 스캔
node gsd-tools.cjs audit-uat

# config 검사와 함께 git commit
node gsd-tools.cjs commit <message> [--files f1 f2] [--amend] [--no-verify]
```

> **`--no-verify`**: pre-commit hook을 건너뜁니다. wave 기반 병렬 실행 중 build lock 충돌(예: Rust 프로젝트의 cargo lock 경쟁)을 피하려고 병렬 executor 에이전트가 사용합니다. orchestrator는 각 wave가 끝난 뒤 hook을 한 번만 실행합니다. 순차 실행에서는 `--no-verify`를 쓰지 말고 hook이 평소처럼 돌도록 두세요.

## 웹 검색(Brave API key 필요)
```bash
node gsd-tools.cjs websearch <query> [--limit N] [--freshness day|week|month]
```

---

## 모듈 아키텍처

| 모듈 | 파일 | 내보내는 항목 |
|--------|------|---------------|
| Core | `lib/core.cjs` | `error()`, `output()`, `parseArgs()`, 공통 유틸리티 |
| State | `lib/state.cjs` | 모든 `state` 하위 명령, `state-snapshot` |
| 단계 | `lib/phase.cjs` | 단계 CRUD, `find-phase`, `phase-plan-index`, `phases list` |
| Roadmap | `lib/roadmap.cjs` | roadmap 파싱, phase 추출, 진행도 갱신 |
| Config | `lib/config.cjs` | config 읽기/쓰기, 섹션 초기화 |
| Verify | `lib/verify.cjs` | 모든 verification 및 validation 명령 |
| Template | `lib/template.cjs` | 템플릿 선택과 변수 채우기 |
| 머리말 | `lib/frontmatter.cjs` | YAML 머리말 CRUD |
| Init | `lib/init.cjs` | 모든 워크플로용 복합 컨텍스트 로딩 |
| Milestone | `lib/milestone.cjs` | milestone 아카이브, requirements 완료 처리 |
| Commands | `lib/commands.cjs` | 기타: slug, timestamp, todo, scaffold, stats, websearch |
| Model Profiles | `lib/model-profiles.cjs` | profile 해석 테이블 |
| UAT | `lib/uat.cjs` | cross-phase UAT/verification 감사 |
| Profile Output | `lib/profile-output.cjs` | 개발자 프로필 포맷팅 |
| Profile Pipeline | `lib/profile-pipeline.cjs` | 세션 분석 파이프라인 |
