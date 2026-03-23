# 컨텍스트 창 모니터

컨텍스트 창 사용량이 높아졌을 때 에이전트에게 경고를 주는 post-tool hook입니다. Claude Code에서는 `PostToolUse`, Gemini CLI에서는 `AfterTool` 이벤트를 사용합니다.

## 문제

statusline은 **사용자**에게는 컨텍스트 사용량을 보여 주지만, **에이전트** 자신은 그 한계를 직접 알지 못합니다. 그래서 컨텍스트가 거의 바닥나도 저장 없이 계속 작업하다가 중간에 끊길 수 있습니다.

## 동작 방식

1. statusline hook이 컨텍스트 메트릭을 `/tmp/claude-ctx-{session_id}.json`에 기록합니다.
2. 각 tool 사용 후 context monitor가 이 메트릭을 읽습니다.
3. 남은 컨텍스트가 임계값 아래로 내려가면 `additionalContext` 경고를 주입합니다.
4. 에이전트는 대화 안에서 이 경고를 받고, 작업 마무리나 상태 저장을 판단할 수 있습니다.

## 임계값

| 레벨 | 남은 | 상담원 행동 |
|-------|-----------|----------------|
| Normal | > 35% | 경고 없음 |
| WARNING | <= 35% | 현재 작업을 정리하고 새 복잡 작업 시작을 피함 |
| CRITICAL | <= 25% | 즉시 멈추고 상태 저장 (`/gsd:pause-work`) |

## 디바운스

경고가 너무 자주 반복되지 않도록 다음 규칙을 둡니다.
- 첫 경고는 즉시 발생
- 이후 경고는 tool 5회 사용 간격 필요
- 심각도 상승(`WARNING -> CRITICAL`)은 debounce를 우회

## 아키텍처

```
Statusline Hook (gsd-statusline.js)
    | writes
    v
/tmp/claude-ctx-{session_id}.json
    ^ reads
    |
Context Monitor (gsd-context-monitor.js, PostToolUse/AfterTool)
    | injects
    v
additionalContext -> Agent sees warning
```

bridge 파일은 단순한 JSON 객체입니다.

```json
{
  "session_id": "abc123",
  "remaining_percentage": 28.5,
  "used_pct": 71,
  "timestamp": 1708200000
}
```

## GSD 연동

GSD의 `/gsd:pause-work` 명령은 실행 상태를 저장합니다. WARNING 메시지는 이를 권장하고, CRITICAL 메시지는 즉시 상태를 저장하라고 안내합니다.

## 설정

두 hook은 `npx get-shit-done-ko` 설치 중 자동 등록됩니다.

- **Statusline** (bridge 파일 기록): settings.json의 `statusLine`으로 등록
- **Context Monitor** (bridge 파일 읽기): settings.json의 `PostToolUse` hook으로 등록 (`Gemini`는 `AfterTool`)

Claude Code에서 `~/.claude/settings.json`에 수동 등록하려면:

```json
{
  "statusLine": {
    "type": "command",
    "command": "node ~/.claude/hooks/gsd-statusline.js"
  },
  "hooks": {
    "PostToolUse": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node ~/.claude/hooks/gsd-context-monitor.js"
          }
        ]
      }
    ]
  }
}
```

Gemini CLI(`~/.gemini/settings.json`)에서는 `PostToolUse` 대신 `AfterTool`을 사용합니다.

```json
{
  "hooks": {
    "AfterTool": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node ~/.gemini/hooks/gsd-context-monitor.js"
          }
        ]
      }
    ]
  }
}
```

## 안전성

- hook은 전체 로직을 try/catch로 감싸고 오류 시 조용히 종료합니다.
- tool 실행을 막지 않습니다. 모니터가 망가져도 에이전트 워크플로는 계속되어야 합니다.
- 60초보다 오래된 메트릭은 무시합니다.
- bridge 파일이 없어도(서브에이전트, 새 세션 등) 안전하게 처리합니다.
