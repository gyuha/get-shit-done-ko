# GSD용 지침 (Instructions for GSD)

> 한국어 우선 안내: 이 템플릿은 `copilot-instructions` 자산을 한국어 기준으로 먼저 읽을 수 있게 정리합니다. 아래 영문 원문은 upstream 동기화와 세부 의미 보존을 위해 함께 유지합니다.


- 사용자가 GSD를 요청하거나 `gsd-*` 명령을 쓰면 `get-shit-done` skill을 사용합니다.
- `/gsd-...` 또는 `gsd-...`는 command invocation으로 보고 `.github/skills/gsd-*`의 대응 파일을 불러옵니다.
- command가 subagent spawn을 요구하면 `.github/agents`의 대응 custom agent를 우선 사용합니다.
- 사용자가 명시적으로 요청하지 않았다면 GSD workflow를 강제로 적용하지 않습니다.
- After completing any `gsd-*` command (or any deliverable it triggers: feature, bug fix, tests, docs, etc.), ALWAYS: (1) offer the user the next step by prompting via `ask_user`; repeat this feedback loop until the user explicitly indicates they are done.
