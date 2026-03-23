# Discuss Mode: Assumptions vs Interview

GSD의 `discuss-phase`에는 planning 전에 구현 맥락을 모으는 두 가지 모드가 있습니다.

## Modes

### `discuss` (default)

기존 인터뷰형 흐름입니다. Claude가 phase의 gray area를 찾아 보여 주고, 사용자가 고른 영역마다 대략 4개 안팎의 질문을 이어 갑니다. 다음 상황에 잘 맞습니다.

- 코드베이스가 아직 익숙하지 않은 초반 phase
- 사용자가 선호를 적극적으로 먼저 표현하고 싶은 phase
- 대화형으로 안내받는 방식을 선호하는 사용자

### `assumptions`

코드베이스 우선 흐름입니다. Claude가 서브에이전트를 통해 관련 파일 5~15개를 깊게 읽고, 근거가 있는 가정을 정리한 뒤 확인 또는 수정 대상으로 제시합니다. 다음 상황에 잘 맞습니다.

- 패턴이 이미 분명한 성숙한 코드베이스
- 인터뷰 질문이 너무 자명하다고 느끼는 사용자
- 더 짧은 상호작용으로 맥락을 모으고 싶은 경우

## Configuration

```bash
# Enable assumptions mode
gsd-tools config-set workflow.discuss_mode assumptions

# Switch back to interview mode
gsd-tools config-set workflow.discuss_mode discuss
```

이 설정은 프로젝트 단위이며 `.planning/config.json`에 저장됩니다.

## How Assumptions Mode Works

1. **Init** — discuss mode와 동일하게 기존 컨텍스트를 로드하고 코드베이스를 훑습니다.
2. **Deep analysis** — phase와 관련된 코드 파일 5~15개를 탐색합니다.
3. **Surface assumptions** — 각 가정에는 다음이 포함됩니다.
   - Claude가 그렇게 판단한 이유와 근거 파일 경로
   - 그 가정이 틀렸을 때 생길 문제
   - 신뢰도(`Confident` / `Likely` / `Unclear`)
4. **Confirm or correct** — 사용자가 가정을 검토하고 수정할 항목을 고릅니다.
5. **Write CONTEXT.md** — 결과는 discuss mode와 동일한 형식으로 저장됩니다.

## Flag Compatibility

| Flag | `discuss` mode | `assumptions` mode |
|------|----------------|-------------------|
| `--auto` | Auto-selects recommended answers | Skips confirm gate, auto-resolves Unclear items |
| `--batch` | Groups questions in batches | N/A (corrections already batched) |
| `--text` | Plain-text questions (remote sessions) | Plain-text questions (remote sessions) |
| `--analyze` | Shows trade-off tables per question | N/A (assumptions include evidence) |

## Output

두 모드는 모두 동일한 6개 섹션을 가진 CONTEXT.md를 생성합니다.
- `<domain>` — phase 경계
- `<decisions>` — 고정된 구현 결정
- `<canonical_refs>` — downstream agent가 반드시 읽어야 하는 스펙/문서
- `<code_context>` — 재사용 자산, 패턴, 통합 지점
- `<specifics>` — 사용자 참고사항과 선호
- `<deferred>` — 이후 phase로 미룬 아이디어

이후 단계의 researcher, planner, checker는 어떤 모드로 만들었든 동일한 방식으로 이 CONTEXT.md를 사용합니다.
