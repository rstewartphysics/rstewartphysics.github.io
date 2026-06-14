---
name: improve-page
description: Improve or refine an existing HTML/CSS page on mrstewartphysics.co.uk. Use when the user asks to "improve html and css", "fix/polish/refine this page", tidy styling, improve accessibility, or bring a page in line with the design system. Reads the target page and applies design-system, a11y, and platform-guardrail fixes.
---

# /improve-page — refine an existing page

1. **Read** the target page in full, plus `.claude/skills/shared/page-checklist.md` and the
   references it lists. For a Higher topic page, also read `higher-topic-page-guide.md`.
2. **Audit** the page against: the subject's correct theme/palette, the standard head block,
   the component patterns in CLAUDE.md, every a11y requirement, and the platform guardrails.
   Note what's already fine vs what diverges — don't rewrite working code for its own sake.
3. **Apply fixes** that match the surrounding code's idiom, naming, and comment density.
   Preserve the page's existing palette and `localStorage` prefix unless asked to change them.
4. **Run the pre-commit checklist** (shared checklist + guide §11 for Higher).
5. **Report** a short before/after list of what changed and why. Commit/push only if asked.

Prefer the smallest change that fixes the issue. Don't introduce new interactives unless asked.
