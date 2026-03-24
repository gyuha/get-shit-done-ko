# 개발자 프로필 (Developer Profile)

> 한국어 우선 안내: 이 템플릿은 `user-profile` 자산을 한국어 기준으로 먼저 읽을 수 있게 정리합니다. 아래 영문 원문은 upstream 동기화와 세부 의미 보존을 위해 함께 유지합니다.


> This profile was generated from session analysis. It contains behavioral directives
> for Claude to follow when working with this developer. HIGH confidence dimensions
> should be acted on directly. LOW confidence dimensions should be approached with
> hedging ("Based on your profile, I'll try X -- let me know if that's off").

**Generated:** {{generated_at}}
**Source:** {{data_source}}
**Projects Analyzed:** {{projects_list}}
**Messages Analyzed:** {{message_count}}

---

## Quick Reference (빠른 참고)

{{summary_instructions}}

---

## Communication Style (커뮤니케이션 스타일)

**Rating:** {{communication_style.rating}} | **Confidence:** {{communication_style.confidence}}

**Directive:** {{communication_style.claude_instruction}}

{{communication_style.summary}}

**Evidence:**

{{communication_style.evidence}}

---

## Decision Speed (의사결정 속도)

**Rating:** {{decision_speed.rating}} | **Confidence:** {{decision_speed.confidence}}

**Directive:** {{decision_speed.claude_instruction}}

{{decision_speed.summary}}

**Evidence:**

{{decision_speed.evidence}}

---

## Explanation Depth (설명 깊이)

**Rating:** {{explanation_depth.rating}} | **Confidence:** {{explanation_depth.confidence}}

**Directive:** {{explanation_depth.claude_instruction}}

{{explanation_depth.summary}}

**Evidence:**

{{explanation_depth.evidence}}

---

## Debugging Approach (디버깅 접근)

**Rating:** {{debugging_approach.rating}} | **Confidence:** {{debugging_approach.confidence}}

**Directive:** {{debugging_approach.claude_instruction}}

{{debugging_approach.summary}}

**Evidence:**

{{debugging_approach.evidence}}

---

## UX Philosophy (UX 철학)

**Rating:** {{ux_philosophy.rating}} | **Confidence:** {{ux_philosophy.confidence}}

**Directive:** {{ux_philosophy.claude_instruction}}

{{ux_philosophy.summary}}

**Evidence:**

{{ux_philosophy.evidence}}

---

## Vendor Philosophy (벤더 철학)

**Rating:** {{vendor_philosophy.rating}} | **Confidence:** {{vendor_philosophy.confidence}}

**Directive:** {{vendor_philosophy.claude_instruction}}

{{vendor_philosophy.summary}}

**Evidence:**

{{vendor_philosophy.evidence}}

---

## Frustration Triggers (답답함 유발 요인)

**Rating:** {{frustration_triggers.rating}} | **Confidence:** {{frustration_triggers.confidence}}

**Directive:** {{frustration_triggers.claude_instruction}}

{{frustration_triggers.summary}}

**Evidence:**

{{frustration_triggers.evidence}}

---

## Learning Style (학습 스타일)

**Rating:** {{learning_style.rating}} | **Confidence:** {{learning_style.confidence}}

**Directive:** {{learning_style.claude_instruction}}

{{learning_style.summary}}

**Evidence:**

{{learning_style.evidence}}

---

## Profile Metadata (프로필 메타데이터)

| Field | Value |
|-------|-------|
| Profile Version | {{profile_version}} |
| Generated | {{generated_at}} |
| Source | {{data_source}} |
| Projects | {{projects_count}} |
| Messages | {{message_count}} |
| Dimensions Scored | {{dimensions_scored}}/8 |
| High Confidence | {{high_confidence_count}} |
| Medium Confidence | {{medium_confidence_count}} |
| Low Confidence | {{low_confidence_count}} |
| Sensitive Content Excluded | {{sensitive_excluded_summary}} |
