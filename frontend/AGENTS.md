# Frontend Agent Rules

Instructions for all work in `frontend/`.

---

## Stack

- **Angular 20** — standalone components, signals-first, `OnPush` by default.
- **UI:** PrimeNG + TailwindCSS. Do not introduce Angular Material.
- **TypeScript:** strict mode. No `any`. Explicit interfaces/models everywhere.

---

## Project Structure

| Path | Purpose |
|---|---|
| `src/app/features/` | Feature modules (scoped components, stores, routes) |
| `src/app/shared/` | Reusable UI components and utilities |
| `src/app/core/` | App-wide services, state, theming |

- File names: `kebab-case` throughout.
- Keep feature boundaries clear — no cross-feature imports.
- Lazy-load feature routes; avoid eagerly loading feature-specific code in `core/`.

---

## Commands

```bash
npm ci           # install
npm run start    # dev server
npm run build    # production build — run before finishing
npm run test     # all specs
npm run test -- --include="src/app/path/file.spec.ts" --watch=false --browsers=ChromeHeadless
```

---

## Angular Rules

- **Change detection:** `ChangeDetectionStrategy.OnPush` on every component.
- **Reactivity:** prefer signals and `computed()`; avoid `ngOnChanges` when a `computed` suffices.
- **Effects:** use `effect()` only for side effects (DOM, external APIs); never to derive state.
- **Forms:** typed reactive forms (`FormGroup<T>`); no untyped forms.
- **Components:** keep them lean. Business logic belongs in stores/services.
- **Stores:** follow existing NgRx Signal Store patterns and conventions already in the codebase.
- **Imports order:** framework → third-party → internal (enforced by linter).

---

## PrimeNG Usage

- Use PrimeNG for **behavior primitives**: buttons, dialogs, overlays, menus, inputs, tables, virtual scroll.
- **Never** ship default PrimeNG visual style — always override with Tailwind and semantic tokens.
- Build reusable wrappers for any PrimeNG primitive used in more than one feature.
- Component-specific Prime token overrides go in a CSS file next to the component (e.g., `multiselect.css`), not in `styles.css`.

---

## Style System

### Tokens and primitives

- Source of truth for global tokens and shared primitives: **`frontend/src/styles.css`**.
- Prefer in order: existing `styles.css` classes → Prime tokens (`--p-*`) → semantic app colors → Tailwind scale utilities → arbitrary values (last resort).
- Do **not** add feature-specific classes to `styles.css`.
- Prefer Tailwind standard typography utilities directly in templates (`text-xs`, `text-sm`, `text-base`, `tracking-wide`) before introducing shared primitives.
- Extension workflow:
  1. Reuse existing class from `styles.css`.
  2. Multi-feature reuse → add under `@layer components` in `styles.css`.
  3. Single-feature use → keep in that feature's template or local stylesheet.

### Color discipline

- Must work in **both light and dark** modes — no hardcoded theme-specific colors.
- Use semantic tokens: `text-color`, `text-muted-foreground`, `bg-card`, `bg-foreground`, etc.
- Accent color → key actions, focus, active states only.
- Status colors → muted and readable; never neon.
- Maintain consistent surface relationships: page → container → row → control (no "floating" sections from mismatched contrast).

### Visual style principles

- Calm, premium, product-grade SaaS aesthetic.
- **Hierarchy:** primary content → secondary context → meta/supporting text.
- Reduce noise: fewer containers, fewer borders, fewer competing accents.
- Spacing and typography first; decoration last.
- Dense lists → light row delineation (soft border + rhythm) over shadows or thick outlines.
- Separators → subtle borders/dividers only.

---

## Component Rules

- **Host display:** set in component metadata — `host: { class: 'block' }`. Do not create a CSS file just for `:host { display: block; }`.
- Create a component CSS file only when it contains meaningful component-specific styles.

---

## Responsive / Mobile

- Design **mobile-first**; verify at 375 / 390 / 430 px widths.
- Primary actions must remain usable at small sizes (no clipped labels, no forced wrapping unless intentional).
- Match control sizes within the same action group.
- Lists on mobile: clear row boundaries, stable spacing rhythm, no text overlapping chips or input chrome.
- Popovers / dropdowns / dialogs: readable and touch-friendly on mobile.

---

## Accessibility and Interaction

- Interactive elements must look interactive: `cursor`, hover state, focus ring.
- Preserve keyboard navigation and visible focus indicators.
- Maintain contrast/readability in both themes.
- Keep clickable targets clear, consistent, and touch-friendly.

---

## Page and Layout Conventions

New pages follow this rhythm:

1. **Lightweight page header** — title + primary action, no heavy chrome.
2. **Compact secondary controls** — filters, search, toggles.
3. **Primary content area** — strong scanability; structured list rows over heavy card stacks.

- Metadata: concise, grouped into readable lines.
- Avatar / status / action treatments: consistent across features.

---

## Quality Checklist (before finishing)

- [ ] `npm run build` passes with no errors.
- [ ] Touched flows validated in **light and dark** themes.
- [ ] Touched flows validated on **mobile and desktop**.
- [ ] No unrelated restyling in the diff.
- [ ] No `any`, no untyped forms, no hardcoded colors.
- [ ] New shared primitives documented in this file.

---

## Maintaining This File

- When introducing layout patterns, theming behavior, interaction rules, or responsive conventions → update this file in the same changeset.
- When adding/changing shared style primitives → update the source-of-truth path and extension rules above.
- Keep rules concise, practical, and directive — future contributors should produce consistent UI automatically.
