# CLAUDE.md

Guidance for AI agents (and humans) working on this repository.
Auto-loaded by Claude Code at the start of each session.

## Project

A small, static **single-page "business card" website** (German: *Visitenkarte*)
for a German tax advisor (*Steuerberaterin*): **Ann-Kathrin Garrell – AG
Steuerberatung**, based in Lipperode (Lippstadt), Germany.

The site is intentionally lightweight: one landing page plus two legal pages.

## Tech stack & constraints

- **Plain static HTML + one CSS file. No build step, no framework, no
  dependencies, no JavaScript** (the page works fully without JS).
- Do **not** introduce bundlers, npm packages, CSS frameworks, or client-side
  JS unless explicitly requested. Keep it a zero-dependency static site.
- **No external assets at runtime** (GDPR): system font stack only — no Google
  Fonts, no CDNs, no trackers, no cookies. Keep it that way.
- Images live in `assets/` and are referenced with relative paths.

## File structure

```
index.html          Landing page (the "card": hero, services, focus areas, contact)
impressum.html      Legal notice (Impressum) — standalone page
datenschutz.html    Privacy policy (Datenschutzerklärung) — standalone page
card.css            All styles (shared by all three pages)
assets/
  ann-kathrin-garrell.jpg   B/W portrait used in the hero
  og-image.jpg              1200x630 Open Graph preview image
CNAME               GitHub Pages custom domain (www.garrell-steuerberatung.de)
.github/workflows/pages.yml   GitHub Pages deploy workflow
```

Design system lives in the `:root` CSS variables in `card.css`
(crimson `#C8102E`, navy `#1C2234`, etc.). Reuse those variables; don't
hardcode colors. The `.card`, `.legal-page`, `.legal-topbar`, `.address`,
and `.card-footer` classes are shared across pages — keep them consistent.

## Language conventions

- **Code, comments, commit messages, branch names, and this doc: English.**
- **User-facing website content stays German** (all page copy and the legal
  texts). Do not translate the visible content to English.

## Content & legal rules (important)

German tax advisors are bound by strict professional-advertising rules
(**§ 57a StBerG**, **§§ 9/10 BOStB**). All visible copy must be **sachlich**
(factual/objective) and must **not** be promotional:

- No superlatives / self-praise, no comparative claims, no promises of success
  or specific savings, no fee-waiver advertising ("kostenlos").
- No client testimonials (both advertising-sensitive and confidentiality).

Legal pages:

- **Impressum** cites **§ 5 DDG** (not the old § 5 TMG), lists StBerG, DVStB,
  BOStB, StBVV, names the *Steuerberaterkammer Westfalen-Lippe*, and includes
  the professional-liability insurer (§ 2 DL-InfoV).
- **Datenschutzerklärung** is written in **first-person singular ("Ich"-Form)**
  because this is a solo practice with no employees. Keep any new legal text in
  that voice. Neutral legal terms ("der Verantwortliche", "die betroffene
  Person") are fine as-is.
- Legal texts are business-critical. When editing, preserve meaning and
  structure; prefer verbatim client-provided text. Recommend a review by the
  chamber / a lawyer before go-live after substantive edits.

## Key facts (already public via the Impressum)

- Name: Ann-Kathrin Garrell, Steuerberaterin
- Address: An der Heideblume 3, 59558 Lippstadt (Lipperode), Germany
- Phone: +49 15679 816820 · Email: ak@ag-steuerberatung.de
- Chamber: Steuerberaterkammer Westfalen-Lippe
- Professional liability: andsafe AG, Provinzial-Allee 1, 48159 Münster
  (coverage: worldwide)
- Website domain: **www.garrell-steuerberatung.de** (primary, with `www`)
- Note: the email domain (`ag-steuerberatung.de`) differs from the website
  domain; email is hosted elsewhere — do not touch its DNS/MX.

## Hosting & deployment

- Currently hosted on **GitHub Pages**, deployed by
  `.github/workflows/pages.yml` on every push to `main`.
- Custom domain via `CNAME` = `www.garrell-steuerberatung.de`.
- **Cloudflare** manages DNS: A/AAAA records on the apex point to GitHub Pages
  IPs and `www` is a CNAME to `<user>.github.io`, all set to **DNS only (grey
  cloud)** so GitHub can issue TLS. The `.com` domain 301-redirects to the
  `.de` via a Cloudflare redirect rule.
- **Planned:** move to the client's own server later. When that happens, update
  the **Datenschutz "Hosting" section** (§4) to name the new host instead of
  GitHub, and revisit `CNAME` / the workflow. If Cloudflare's proxy (orange
  cloud) is ever enabled, add Cloudflare to the privacy policy.

## Git workflow

- Develop on a feature branch (e.g. `claude/...`), commit, push.
- **Direct pushes to `main` are blocked** — open a PR; the owner merges it.
  The GitHub Pages deploy runs after the merge to `main`.

## Local preview

No test suite. To verify, open the `.html` files directly in a browser, or take
headless screenshots (Chromium is available). Check both desktop and mobile
widths and that the three page footers stay in sync.

## License

This is **proprietary, all-rights-reserved** software/content (see `LICENSE`).
It is **not** open source — do not add an open-source license or public-domain
dedication, and do not reuse the code/content elsewhere without the owner's
written permission.

## Open TODOs

- Add the **USt-IdNr.** to the Impressum once available (the section was
  intentionally removed until then).
- The footer year is **hardcoded ("2026")** in all three HTML files — bump it at
  the turn of the year.
- Keep the shared footer ("Made with ❤️ in Lipperode", legal links) identical
  across `index.html`, `impressum.html`, and `datenschutz.html`.
- The Open Graph image is `assets/og-image.jpg` (1200x630); regenerate it if the
  name, role, or portrait changes.
