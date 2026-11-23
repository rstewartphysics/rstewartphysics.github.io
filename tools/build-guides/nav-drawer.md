# Navigation drawer and site search

Moved out of the site `CLAUDE.md` on 23 Nov 2026 (teacher-approved trim); CLAUDE.md keeps the summary and points here.

## Navigation drawer

Markup in `_includes/site-menu.html`, styles in `site-menu.css`, behaviour in `site-menu.js`.

### Required HTML IDs (must match JS)

| ID | Element |
|----|---------|
| `siteMenuButton` | Open/close toggle button |
| `siteMenuOverlay` | Background overlay |
| `siteMenuDrawer` | The `<aside>` drawer |
| `siteMenuClose` | Close button inside the drawer |

### Behaviour
Slides in from the right; opening adds `.is-open` to drawer+overlay and `site-menu-open` to `<body>`.
ESC, overlay-click, the × and a swipe to the right close it; focus is trapped while open. On open
the drawer itself takes focus, not its first row — iOS Safari rings whatever takes focus after a tap.
While it is open the ☰ is hidden (the × is the one close button) and so is the progress counter.
**Every folder collapses when the menu closes** (RS, 28 Sep 2026), so each open starts from the same
short list. `markCurrentPage()` sets `aria-current="page"` on the matching link and puts a short
accent bar (`.has-current`) on the row of every folder above it, instead of opening them.

**Header.** One row: the logo mark and "MrStewartPhysics.co.uk" as plain text (not a link — the Home
row is), then the ×. No "Menu" title.

**Marks and colours.** Every top row carries a drawn mark (`.site-menu-ic`, 26px) — drawer copies
under `smi-` ids of the Home tiles' atom, logic gate, gears and chat, plus a drawer house (Home) and
the certificate (Credits). Each row sets `--c` / `--c-dk`, the same pair as its Home tile, which
colours its mark and its folder line. All drawer text is 18px (D2). The dark drawer uses the site's
dark teal grounds, not navy.

### Menu order
1. Home `/` · 2. **Physics** (group): All Physics courses (`physics.html`) / S3 / National 5 /
Higher / Advanced Higher · 3. **Electronics** (group): Electronics hub / Slides ·
4. **Engineering Science** (group): All Engineering courses (`engineering-science.html`) / S3 /
National 5 (Higher Engineering is not planned) · then, below a line (`.site-menu-info`),
5. About & Contact · 6. Credits. Every subject is a group, so every subject row does the same thing
when tapped: it opens. Level names inside a group are short and match across subjects (S3,
National 5, Higher); the toggles' `aria-label`s carry the full name. **Do not add individual topic
pages to the drawer.**

**Level rows (28 Sep 2026).** A level with more than its hub is a `.site-menu-level` split row: the
name links to the hub, and a separate arrow (`<details class="site-menu-level-more">`) opens its
hub, Topic pages, Slides and Practice tests (Higher adds Past papers, 12 Oct 2026). Higher and Advanced Higher now list only the hub and **Lessons** (Higher also Past papers; 23 Nov 2026). A level with only a hub is a plain link with no arrow —
never an arrow that opens onto nothing. When a level gains an index page, give it a split row (or
add the link to its list). Groups share `name="site-menu-group"` and level lists
`name="site-menu-level"`, so opening one closes the other with no JS. The list icons are drawer
copies of `resource-icons.html` marks under `smi-` ids, so a page that includes both sprites has no
duplicate ids. Group and level arrows are one glyph, size and colour (`--menu-muted`); the level
toggle's divider is a short faint line, not a full-height wall.

### Site search (12 Oct 2026)
A search box sits under the drawer header on every page (it is part of the include, so a page adds
nothing). Typing hides the folders and lists results; Esc empties the box first, then closes the
menu; closing the menu clears it. Chips filter by S3 / N5 / Higher / AH / Electronics /
Engineering. Each result shows a drawn mark for its type, the title, its course in the subject
colour and a line of matching text — the course/type line and the excerpt are 16px, the one
exception to the drawer's 18px. **Recent searches (last 5) and the chosen chip stay on the device**
(`site-search-recent-v1`, `site-search-course-v1`); nothing about a search is sent anywhere.

**How it is built.** Pagefind (MIT, credited) indexes the finished `_site` in GitHub Actions after
`jekyll build`, into `/pagefind/`, split so a search downloads only what it needs.
`scripts/build-search.mjs` decides what goes in:
- **Pages:** every Jekyll page, indexed from its `<main>` only. Answers (`.reveal`, `#answers`),
  quiz feedback, SVG labels, nav, footer and buttons are left out (`EXCLUDE_SELECTORS`).
- **Left out:** `search: false` or `sitemap: false` in front matter, a robots `noindex`, a redirect,
  or a pattern in `_data/search.yml` (teacher views, placeholders, alpha/beta tools, `/assets/`).
- **PDFs:** only PDFs a searchable page links to, each its own result, named from the link
  (a card's `.deck-name`/`.tile-name`/`.tile-title` first). A vague name ("the booklet") gets
  the page's title in front. Credits-page links don't count.
- **Course and type come from the URL** (`COURSES` and `typeOf()` in the script). A page in an
  existing folder needs nothing; **a new course folder needs one line in `COURSES`.**
- **Titles** are the front-matter `title` (or `search_title`), minus a course part like
  "— Higher Physics", which the result's label already shows. `search_keywords:` in front matter
  adds extra words a page should be found by.
- **Synonyms:** `_data/search-synonyms.yml` (`ohms law: resistance`). Add a line when pupils use a
  word the site doesn't.

