---
name: ui-quality
description: Preserve Eternity UI quality and consistency. Use when building or restyling pages, components, dialogs, tables, filters, responsive layouts, or theme-related UI.
---

# UI Quality and Consistency

## Goal

Keep UI changes consistent with the current Eternity product feel and avoid generic, random, or default-looking output.

## Use this when

- Building or restyling pages, sections, components, dialogs, filters, tables, or mobile layouts.

## Workflow

1. Inspect 1-2 nearby screens before designing.
2. Match the existing visual language unless the task explicitly asks for a new direction.
3. Prefer spacing, typography, and structure over extra chrome.
4. Use PrimeNG for behavior and existing theme tokens or Tailwind utilities for final presentation.
5. Validate light theme, dark theme, mobile, and desktop behavior.

## Design rules

- Prefer a calm, product-grade SaaS feel over template-heavy UI.
- Let spacing, typography, and row structure create hierarchy before adding borders or shadows.
- Keep headers and controls compact unless the feature needs stronger emphasis.
- Preserve dark mode and touch-target quality.

## Avoid

- Default PrimeNG look with no product styling.
- Random accent colors, oversized shadows, or unnecessary card stacks.
- One-off visual systems that do not match nearby screens.
- Hardcoded colors that break theme consistency.

## Check nearby sources

- `frontend/src/styles.css`
- `frontend/src/app/core/themes/eternity-theme.ts`
- `frontend/src/app/core/themes/theme.service.ts`
- nearby screens under `frontend/src/app/features/`
