# 멀티 프로젝트 워크스페이스 (`/gsd:new-workspace`)

**문제:** #1241
**날짜:** 2026-03-20
**상태:** 승인됨

## 문제

GSD는 작업 디렉터리당 하나의 `.planning/` 디렉터리에 연결되어 있습니다. 여러 독립 프로젝트(20개 이상의 하위 저장소가 있는 단일 저장소 스타일 설정)가 있는 사용자 또는 동일한 저장소에서 기능 분기 격리가 필요한 사용자는 수동 복제 및 상태 관리 없이 병렬 GSD 세션을 실행할 수 없습니다.

## 솔루션

**물리적 워크스페이스 디렉터리**를 생성, 나열, 제거하는 세 가지 새 명령입니다. 각 워크스페이스는 저장소 복사본(git worktree 또는 clone)과 독립적인 `.planning/` 디렉터리를 포함합니다.

여기에는 두 가지 사용 사례가 포함됩니다.
- **다중 저장소 오케스트레이션(A):** 상위 디렉터리의 여러 저장소에 걸친 워크스페이스
- **기능 브랜치 격리(B):** 현재 저장소의 worktree를 포함하는 워크스페이스(`--repos .`인 A의 특수 사례)

## 명령

### `/gsd:new-workspace`

저장소 복사본과 자체 `.planning/`을 포함한 워크스페이스 디렉터리를 만듭니다.
```
/gsd:new-workspace --name feature-b --repos hr-ui,ZeymoAPI --path ~/workspaces/feature-b
/gsd:new-workspace --name feature-b --repos . --strategy worktree   # same-repo isolation
```
**인수:**

| 플래그 | 필수 | 기본값 | 설명 |
|------|----------|---------|-------------|
| `--name` | 예 | — | 워크스페이스 이름 |
| `--repos` | 아니요 | 대화형 선택 | 쉼표로 구분된 저장소 경로 또는 이름 |
| `--path` | 아니요 | `~/gsd-workspaces/<name>` | 대상 디렉토리 |
| `--strategy` | 아니요 | `worktree` | `worktree`(경량, 공유 .git) 또는 `clone`(완전 독립) |
| `--branch` | 아니요 | `workspace/<name>` | 체크아웃할 브랜치 |
| `--auto` | 아니요 | `false` | 대화형 질문을 건너뛰고 기본값 사용 |

### `/gsd:list-workspaces`

`~/gsd-workspaces/*/WORKSPACE.md`를 스캔해 워크스페이스 매니페스트를 찾습니다. 이름, 경로, 저장소 수, GSD 상태(PROJECT.md 존재 여부, 현재 phase)를 표로 보여 줍니다.

### `/gsd:remove-workspace`

확인 후 워크스페이스 디렉터리를 제거합니다. worktree 전략이면 먼저 각 구성원 저장소에 대해 `git worktree remove`를 실행합니다. 커밋되지 않은 변경이 있는 저장소가 있으면 제거를 거부합니다.

## 디렉토리 구조
```
~/gsd-workspaces/feature-b/          # workspace root
├── WORKSPACE.md                      # manifest
├── .planning/                        # independent GSD planning directory
│   ├── PROJECT.md                    # (if user ran /gsd:new-project)
│   ├── STATE.md
│   └── config.json
├── hr-ui/                            # git worktree of source repo
│   └── (repo contents on workspace/feature-b branch)
└── ZeymoAPI/                         # git worktree of source repo
    └── (repo contents on workspace/feature-b branch)
```
주요 속성:
- `.planning/`은 개별 저장소 내부가 아니라 워크스페이스 루트에 있습니다.
- 각 저장소는 워크스페이스 루트 아래의 형제 디렉터리입니다.
- `WORKSPACE.md`는 루트의 유일한 GSD 전용 파일입니다(`.planning/` 제외).
- `--strategy clone`이면 구조는 같지만 저장소는 완전한 clone입니다.

## WORKSPACE.md 형식
```markdown
# Workspace: feature-b

Created: 2026-03-20
Strategy: worktree

## Member Repos

| Repo | Source | Branch | Strategy |
|------|--------|--------|----------|
| hr-ui | /root/source/repos/hr-ui | workspace/feature-b | worktree |
| ZeymoAPI | /root/source/repos/ZeymoAPI | workspace/feature-b | worktree |

## Notes

[User can add context about what this workspace is for]
```
## 작업 흐름

### `/gsd:new-workspace` 워크플로 단계

1. **설정** — `init new-workspace`을 호출하고 JSON 컨텍스트를 구문 분석합니다.
2. **입력 수집** — `--name`/`--repos`/`--path`이 제공되지 않은 경우 대화형으로 질문하세요. 저장소의 경우 cwd의 하위 `.git` 디렉터리를 옵션으로 표시합니다.
3. **검증** — 대상 경로가 존재하지 않습니다(또는 비어 있습니다). 소스 저장소가 존재하며 git 저장소입니다.
4. **작업공간 디렉토리 생성** — `mkdir -p <path>`
5. **저장소 복사** — 각 저장소에 대해 다음을 수행합니다.
   - 작업 트리: `git worktree add <workspace>/<repo-name> -b workspace/<name>`
   - 클론: `git clone <source> <workspace>/<repo-name>`
6. **WORKSPACE.md 작성** — 소스 경로, 전략, 분기가 포함된 매니페스트
7. **.planning/** 초기화 — `mkdir -p <workspace>/.planning`
8. **/gsd:new-project 제공** — 사용자가 새 작업공간에서 프로젝트 초기화를 실행할지 묻습니다.
9. **커밋** — commit_docs가 활성화된 경우 WORKSPACE.md의 원자적 커밋
10. **완료** — 작업 공간 경로 및 다음 단계 인쇄

### 초기화 기능(`cmdInitNewWorkspace`)

다음을 감지합니다.
- cwd의 하위 git repos(대화형 repo 선택용)
- 대상 경로가 이미 존재하는지 여부
- 소스 저장소에 커밋되지 않은 변경 사항이 있는지 여부
- `git worktree` 사용 가능 여부
- 기본 작업공간 기본 디렉토리(`~/gsd-workspaces/`)

워크플로 게이팅을 위한 플래그와 함께 JSON을 반환합니다.

## 오류 처리

### 유효성 검사 오류(블록 생성)

- **대상 경로가 존재하며 비어 있지 않습니다** — 다른 이름/경로를 선택하라는 제안 오류가 발생했습니다.
- **소스 저장소 경로가 존재하지 않거나 git repo가 아닙니다** — 실패한 저장소를 나열하는 동안 오류가 발생했습니다.
- **`git worktree add` 실패** (예: 분기가 존재함) — `workspace/<name>-<timestamp>` 분기로 대체되거나, 그것도 실패하면 오류가 발생합니다.

### 우아한 처리

- **소스 저장소에 커밋되지 않은 변경 사항이 있습니다** — 경고하지만 허용합니다(작업 트리가 새 분기를 체크아웃하고 작업 디렉터리 상태를 복사하지 않음).
- **다중 저장소 작업공간의 부분 실패** — 성공한 저장소로 작업공간 생성, 실패 보고, 부분 WORKSPACE.md 작성
- **`--repos .` (현재 저장소, 사례 B)** — 디렉터리 이름 또는 git 원격에서 저장소 이름을 감지하고 하위 디렉터리 이름으로 사용

### 제거 - 작업 공간 안전

- **작업공간 저장소의 커밋되지 않은 변경 사항** — 제거를 거부하고 변경 사항이 있는 저장소를 인쇄합니다.
- **워크트리 제거 실패**(예: 소스 저장소 삭제) — 경고하고 디렉터리 정리를 계속합니다.
- **확인** — 작업공간 이름을 입력하여 명시적인 확인이 필요합니다.

### 목록-작업공간 엣지 케이스

- **`~/gsd-workspaces/`이 존재하지 않습니다** — "작업공간을 찾을 수 없습니다."
- **WORKSPACE.md가 존재하지만 내부 저장소가 사라짐** — 작업공간을 표시하고 저장소를 누락으로 표시

## 테스트

### 단위 테스트(`tests/workspace.test.cjs`)

1. `cmdInitNewWorkspace`는 올바른 JSON을 반환합니다. 하위 git 저장소를 감지하고, 대상 경로를 검증하고, git 작업 트리 가용성을 감지합니다.
2. WORKSPACE.md 생성 — 저장소 테이블, 전략, 날짜가 포함된 올바른 형식
3. Repo 검색 — cwd 하위 항목의 `.git` 디렉터리를 식별하고 git이 아닌 디렉터리 및 파일을 건너뜁니다.
4. 유효성 검사 — 비어 있지 않은 기존 대상 경로를 거부하고 git이 아닌 소스 경로를 거부합니다.

### 통합 테스트(동일 파일)

5. 작업 트리 생성 - 작업 공간을 생성하고 repo 디렉터리가 유효한 git 작업 트리인지 확인합니다.
6. 클론 생성 - 작업 공간을 생성하고 저장소가 독립 클론인지 확인합니다.
7. 목록 작업 공간 — 두 개의 작업 공간을 생성하고 목록 출력에 두 작업 공간이 모두 포함되어 있는지 확인합니다.
8. 작업 공간 제거 - 작업 트리를 사용하여 작업 공간을 생성하고 제거한 후 정리를 확인합니다.
9. 부분적 실패 — 하나의 유효한 저장소 + 하나의 유효하지 않은 경로, 유효한 저장소로만 생성된 작업공간

모든 테스트는 임시 디렉토리를 사용하고 자체적으로 정리됩니다. 기존 `node:test` + `node:assert` 패턴을 따릅니다.

## 구현 파일

| 구성요소 | 경로 |
|------------|------|
| 명령: new-workspace | `commands/gsd/new-workspace.md` |
| 명령: 목록-작업 공간 | `commands/gsd/list-workspaces.md` |
| 명령: 제거 작업공간 | `commands/gsd/remove-workspace.md` |
| 워크플로우: new-workspace | `get-shit-done/workflows/new-workspace.md` |
| 작업 흐름: 목록-작업 공간 | `get-shit-done/workflows/list-workspaces.md` |
| 작업 흐름: 작업 공간 제거 | `get-shit-done/workflows/remove-workspace.md` |
| 초기화 기능 | `get-shit-done/bin/lib/init.cjs`(`cmdInitNewWorkspace`, `cmdInitListWorkspaces`, `cmdInitRemoveWorkspace` 추가) |
| 라우팅 | `get-shit-done/bin/gsd-tools.cjs`(초기화 스위치에 사례 추가) |
| 테스트 | `tests/workspace.test.cjs` |

## 디자인 결정

| 결정 | 근거 |
|----------|-----------|
| 논리적 레지스트리를 통한 물리적 디렉터리 | 파일 시스템은 진실의 소스입니다. GSD의 기존 cwd 기반 탐지 패턴과 일치 |
| Worktree를 기본 전략으로 사용 | 경량(공유 .git 개체), 빠른 생성, 쉬운 정리 |
| 작업공간 루트의 `.planning/` | 개별 repo 계획과 완전히 분리됩니다. 각 작업공간은 독립적인 GSD 프로젝트입니다 |
| 중앙 레지스트리 없음 | 상태 드리프트를 방지합니다. `list-workspaces`은 파일 시스템을 직접 스캔합니다 |
| A의 특별한 경우인 사례 B | `--repos .`은 동일한 기계를 재사용하므로 특별한 기능 분기 코드가 필요하지 않습니다 |
| 기본 경로 `~/gsd-workspaces/<name>` | `list-workspaces`을(를) 스캔할 예측 가능한 위치로 작업공간을 소스 저장소에서 제외 |
