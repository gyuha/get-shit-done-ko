# 디버그 서브에이전트 프롬프트 템플릿 (Debug Subagent Prompt Template)

> 한국어 우선 안내: 이 템플릿은 `debug-subagent-prompt` 자산을 한국어 기준으로 먼저 읽을 수 있게 정리합니다. 아래 영문 원문은 upstream 동기화와 세부 의미 보존을 위해 함께 유지합니다.


gsd-debugger agent를 spawn할 때 쓰는 템플릿입니다. 디버깅 전문성은 agent 자체에 있고, 이 템플릿은 문제 맥락만 전달합니다.

---

## Template (템플릿)

```markdown
<objective>
Investigate issue: {issue_id}

**Summary:** {issue_summary}
</objective>

<symptoms>
expected: {expected}
actual: {actual}
errors: {errors}
reproduction: {reproduction}
timeline: {timeline}
</symptoms>

<mode>
symptoms_prefilled: {true_or_false}
goal: {find_root_cause_only | find_and_fix}
</mode>

<debug_file>
Create: .planning/debug/{slug}.md
</debug_file>
```

---

## Placeholders (치환 변수)

| Placeholder | Source | Example |
|-------------|--------|---------|
| `{issue_id}` | Orchestrator-assigned | `auth-screen-dark` |
| `{issue_summary}` | User description | `Auth screen is too dark` |
| `{expected}` | From symptoms | `See logo clearly` |
| `{actual}` | From symptoms | `Screen is dark` |
| `{errors}` | From symptoms | `None in console` |
| `{reproduction}` | From symptoms | `Open /auth page` |
| `{timeline}` | From symptoms | `After recent deploy` |
| `{goal}` | Orchestrator sets | `find_and_fix` |
| `{slug}` | Generated | `auth-screen-dark` |

---

## Usage (사용법)

**From /gsd:debug:**
```python
Task(
  prompt=filled_template,
  subagent_type="gsd-debugger",
  description="Debug {slug}"
)
```

**From diagnose-issues (UAT):**
```python
Task(prompt=template, subagent_type="gsd-debugger", description="Debug UAT-001")
```

---

## Continuation (이어서 진행)

For checkpoints, spawn fresh agent with:

```markdown
<objective>
Continue debugging {slug}. Evidence is in the debug file.
</objective>

<prior_state>
Debug file: @.planning/debug/{slug}.md
</prior_state>

<checkpoint_response>
**Type:** {checkpoint_type}
**Response:** {user_response}
</checkpoint_response>

<mode>
goal: {goal}
</mode>
```
