---
name: from-pdf
description: Extract content from an SQA PDF (specification, booklet, past paper, marking instructions) and use it to build or improve a page. Use when the user asks to "read this pdf", "use the SQA spec/past paper to…", or wants page content derived from a PDF source. Hands off to /new-page or /improve-page once the source text is extracted.
---

# /from-pdf — build/improve from a PDF source

1. **Extract text with pypdf** — the Read tool and poppler cannot render these PDFs.
   ```bash
   python3 -c "import pypdf,sys; r=pypdf.PdfReader(sys.argv[1]); print('\n'.join(p.extract_text() for p in r.pages))" "<path-to.pdf>"
   ```
   (Higher SQA source PDFs live in `classes/higher/`.) For long docs, target the relevant pages.
2. **Pull out** the exact SQA wording, symbols, relationships, and command words you need.
   Match the relationship-sheet typography rules (serif equations, `<var>` for quantities).
   Don't smuggle in content above the stated course level.
3. **Hand off:**
   - building a new page → follow `/new-page`;
   - editing an existing page → follow `/improve-page`.
   Read `.claude/skills/shared/page-checklist.md` as part of that hand-off.
4. **Report** which PDF/pages you used and what content came from them.
