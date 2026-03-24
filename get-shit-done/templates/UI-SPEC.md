---
phase: {N}
slug: {phase-slug}
status: draft
shadcn_initialized: false
preset: none
created: {date}
---

> 한국어 우선 안내: 이 템플릿은 `UI-SPEC` 자산을 한국어 기준으로 먼저 읽을 수 있게 정리합니다. 아래 영문 원문은 upstream 동기화와 세부 의미 보존을 위해 함께 유지합니다.


# Phase {N} — UI 디자인 계약서 (UI Design Contract)

> 프론트엔드 phase를 위한 시각/상호작용 계약서입니다. `gsd-ui-researcher`가 작성하고 `gsd-ui-checker`가 검증합니다.

---

## Design System (디자인 시스템)

| Property | Value |
|----------|-------|
| Tool | {shadcn / none} |
| Preset | {preset string or "not applicable"} |
| Component library | {radix / base-ui / none} |
| Icon library | {library} |
| Font | {font} |

---

## Spacing Scale (간격 스케일)

Declared values (must be multiples of 4):

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Icon gaps, inline padding |
| sm | 8px | Compact element spacing |
| md | 16px | Default element spacing |
| lg | 24px | Section padding |
| xl | 32px | Layout gaps |
| 2xl | 48px | Major section breaks |
| 3xl | 64px | Page-level spacing |

Exceptions: {list any, or "none"}

---

## Typography (타이포그래피)

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | {px} | {weight} | {ratio} |
| Label | {px} | {weight} | {ratio} |
| Heading | {px} | {weight} | {ratio} |
| Display | {px} | {weight} | {ratio} |

---

## Color (색상)

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | {hex} | Background, surfaces |
| Secondary (30%) | {hex} | Cards, sidebar, nav |
| Accent (10%) | {hex} | {list specific elements only} |
| Destructive | {hex} | Destructive actions only |

Accent reserved for: {explicit list — never "all interactive elements"}

---

## Copywriting Contract (카피라이팅 계약)

| Element | Copy |
|---------|------|
| Primary CTA | {specific verb + noun} |
| Empty state heading | {copy} |
| Empty state body | {copy + next step} |
| Error state | {problem + solution path} |
| Destructive confirmation | {action name}: {confirmation copy} |

---

## Registry Safety (레지스트리 안전성)

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | {list} | not required |
| {third-party name} | {list} | shadcn view + diff required |

---

## Checker Sign-Off (검수 승인)

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** {pending / approved YYYY-MM-DD}
