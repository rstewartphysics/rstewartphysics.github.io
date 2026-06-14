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
6. **Run the pre-commit checklist** (shared checklist + guide §11 for Higher).
7. **Report** what you built, where, and the validation results. Commit/push only if asked.

Keep widget CSS/JS inline. Pare back interactives — notes-led, 1–2 tools max per page.
