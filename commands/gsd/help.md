---
name: gsd:help
description: "한국어 우선 안내 — Show available GSD commands and usage guide"
---
<objective>
한국어 우선 안내: 이 명령 문서는 `/gsd:help` 흐름을 한국어로 먼저 안내합니다. 아래 영문 원문은 upstream 호환성과 세부 의미 보존을 위해 함께 유지합니다.

Display the complete GSD command reference.

Output ONLY the reference content below. Do NOT add:
- Project-specific analysis
- Git status or file context
- Next-step suggestions
- Any commentary beyond the reference
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/help.md
</execution_context>

<process>
한국어 우선 안내: 실제 실행 시에는 아래 워크플로와 참조 경로를 그대로 따르되, 설명 해석은 한국어를 기본으로 사용합니다.

Output the complete GSD command reference from @~/.claude/get-shit-done/workflows/help.md.
Display the reference content directly — no additions or modifications.
</process>
