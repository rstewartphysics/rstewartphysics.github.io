---
name: new-page
description: Scaffold a new HTML/CSS page for mrstewartphysics.co.uk (a class hub, topic page, or interactive). Use when the user asks to "write html and css", "make a new page", "build a topic/interactive page", or create any new student-facing page. Follows the site design system and the canonical reference page's conventions.
---

# /new-page — build a new page

1. **Read** `.claude/skills/shared/page-checklist.md` and the canonical references it lists.
   For a Higher topic page, also read `higher-topic-page-guide.md` in full.
2. **Confirm scope** only if genuinely ambiguous: subject/theme, file location, and what
   interactives (if any) belong on the page. Otherwise infer from the request and proceed.
3. **Place the file** in the correct folder (see CLAUDE.md "File layout"). Higher topics:
   `classes/higher/<unit>/<kebab-topic>.html`. Use absolute `/assets/…` `/classes/…` links.
4. **Scaffold** by copying the structure/components/conventions of the canonical reference
   page — but apply the **subject's own palette**, not the reference page's blue.
5. **Wire it into the site:** flip the hub placeholder from
   `<span class="topic-link soon">Label</span>` to a real `<a class="topic-link" href="…">`,
   and confirm the menu drawer already covers the section (don't add topic pages to the drawer).
6. **Wire in progress/badges (default on every new interactive page):** all live interactive subjects
   now run the shared engine, so a new topic page ships with tracking by default — run **`/add-progress`**
   (it encodes the proven procedure + guardrails). Load the two `defer` scripts in `<head>` after
   `site-menu.js` — `assets/js/progress.js` then the subject config `assets/js/progress/<ns>.js`
   (`electronics` · `higher-physics` · `eng-n5` · `eng-s3`) — add neutral hooks (`data-prog-challenge`
   on each tracked challenge, `.prog-cloze`/`.prog-fillin` blocks, the flagship widget's
   `markSeen`/`record`), and on the hub add the `#progressHub` panel + `data-prog-badges` tile chips.
   The badge id must exist in that subject's config (add one there if the page is a new tracked topic).
   **Never** hand-roll progress JS and **never** a per-page progress key. If a subject has no config yet
   (e.g. Higher Engineering Science), stand one up first via `/add-progress` mode C.
7. **Run the pre-commit checklist** (shared checklist + guide §11 for Higher).
8. **Report** what you built, where, and the validation results. Commit/push only if asked.

Keep widget CSS/JS inline. Pare back interactives — notes-led, 1–2 tools max per page.
