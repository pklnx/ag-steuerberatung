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
- **No external assets at runtime** (GDPR): no Google Fonts, no CDNs, no
  trackers, no cookies. Keep it that way. Fonts are either the system font
  stack or **self-hosted** from `assets/fonts/` — never hotlinked. The site
  currently self-hosts **Source Sans 3** (SIL OFL 1.1, license in
  `assets/fonts/OFL.txt`), served locally with the system stack as fallback,
  so no request ever leaves the origin. Any font must stay self-hosted and
  under an OFL/Apache-style license that permits embedding.
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
  fonts/                    Self-hosted Source Sans 3 (.woff2, weights 400/700/900) + OFL.txt
CNAME               Custom domain (www.garrell-steuerberatung.de) — inert, see Hosting
Dockerfile          Container image: nginx + the static files (no build step)
.dockerignore       Allow-list — only *.html, card.css, assets/, docker/ reach the image
docker/nginx.conf   nginx config (unprivileged, security headers, IP-free access log)
docker-compose.yml  Runs the container on the server
.github/workflows/docker.yml   Builds + pushes the image to GHCR (the only deploy)
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
- Phone: +49 15679 816820 · Email: ak@garrell-steuerberatung.de
- Chamber: Steuerberaterkammer Westfalen-Lippe
- Professional liability: andsafe AG, Provinzial-Allee 1, 48159 Münster
  (coverage: worldwide)
- Website domain: **www.garrell-steuerberatung.de** (primary, with `www`)
- Note: email uses the website domain (`garrell-steuerberatung.de`) but is
  hosted elsewhere (separate MX) — do not touch its DNS/MX.

## Hosting & deployment

**The container image is the only deploy path.** Every push to `main` builds
and publishes it; nothing is deployed to GitHub Pages any more.

- **The cutover has happened.** The repo owner operates the site on the client's
  behalf, on a **netcup** server (netcup GmbH, Daimlerstraße 25, 76185
  Karlsruhe), behind a TLS-terminating reverse proxy that forwards to the
  container. The Pages workflow is deleted and no longer deploys anything.
- **The data-protection chain matters for the legal text:** Ann-Kathrin Garrell
  is the controller, the repo owner is her **processor** (Art. 28 DS-GVO), and
  netcup is a **sub-processor** (Art. 28 Abs. 4 DS-GVO). Do not describe netcup
  as her direct processor — she has no contract with them.
- **Cloudflare** manages DNS and stays on **DNS only (grey cloud)** — it sees
  DNS queries, not website traffic, which is why the privacy policy needs no
  Cloudflare section. If the proxy (orange cloud) is ever switched on,
  Cloudflare terminates TLS and must be added to `datenschutz.html`.
  The `.com` domain 301-redirects to the `.de` via a Cloudflare redirect rule.
- **Datenschutz §4** names the processor by name only (no address, by request),
  netcup as the sub-processor with its full address, states that the data stays
  in the EU, and records the Art. 28 DS-GVO agreement. If the hosting chain,
  the AVV or the Cloudflare setting changes, that section has to change with it.
- **Left over from the old setup:** GitHub Pages was never switched off in the
  repository settings, so it may still serve the frozen pre-cutover copy on its
  `github.io` URL. Set *Settings → Pages → Source* to **None** and delete the
  now-meaningless `CNAME` file.

### Docker

The container is what gets shipped: nginx plus the static files, runnable on
any server.

```sh
docker compose up -d --build      # or: docker build -t garrell-steuerberatung .
curl -I http://127.0.0.1:8080/
```

- **Image:** `nginx:1.30-alpine` + the static files. No build step; the
  `Dockerfile` is pure `COPY`, so `docker/nginx.conf` is the only real logic.
  New `.html` pages are picked up automatically (`COPY *.html`).
- **Published to GHCR** by `.github/workflows/docker.yml` on every push to
  `main` (amd64 + arm64), tagged `latest`, `<YYYYMMDD>` and `sha-<commit>`:
  `ghcr.io/pklnx/garrell-steuerberatung:latest`. The image name is derived from
  `github.repository`, so it follows the repository name automatically. The
  server only needs `docker compose pull && docker compose up -d`. Pull requests
  build the image too, but do not push it.
- **Roll back with the date tag, not `sha-`.** A scheduled rebuild builds the
  same commit again, so it overwrites that commit's `sha-` tag with a newer
  nginx — the `sha-` tag identifies the *content*, not a particular build. The
  `YYYYMMDD` tag is the one that pins a specific image.
- The GHCR package is **public**, so the server pulls it without credentials —
  no `docker login` needed. It inherited that visibility when the repository
  rename created it; if it is ever switched to private, the server needs a login
  with a token carrying `read:packages`. The old `ag-steuerberatung` package
  still holds the pre-rename images and can be deleted.

#### Keeping the software current

The site itself changes rarely; nginx and the Alpine packages inside the image
do not. Four pieces cover that, and each one only works because the one before
it does:

1. **The weekly schedule** in `docker.yml` (Mondays 04:00 UTC) rebuilds the
   unchanged commit, which re-resolves `nginx:1.30-alpine` and picks up its
   current patch release. `pull: true` on the build step is what forces that
   re-resolution — without it a cached base layer would defeat the whole thing.
2. **Dependabot** (`.github/dependabot.yml`) handles what the schedule cannot:
   the pinned minor. `1.30` will go end-of-life eventually and the schedule
   would keep building it; Dependabot opens a PR for the next stable line.
3. **DIUN on the server** polls the registry and reports when `:latest` points
   at a new digest. It only ever sees what CI publishes — which is why the
   schedule is a precondition for it, not an alternative to it. Its silence
   means "nothing was built", not "nothing needs building".
4. **A human pulls.** DIUN notifies, it does not deploy. Nothing restarts the
   container on its own, by choice.

Two things this arrangement depends on:

- **`org.opencontainers.image.created` is pinned to the commit date.**
  `metadata-action` would otherwise stamp the build time into the image config
  and change the manifest digest on every run, so DIUN would report every idle
  Monday rebuild. With the label pinned, an unchanged rebuild is bit-identical
  and stays quiet. Do not drop that override.
- **GitHub disables scheduled workflows after 60 days of repository
  inactivity** — a real risk here, since months can pass without a content
  change. The Dependabot commits are what keep the schedule alive; if Dependabot
  is ever removed, the schedule will quietly stop.
- **Unprivileged by design:** runs as the `nginx` user on port **8080**,
  read-only root filesystem, all capabilities dropped, `no-new-privileges`.
  Everything writable (pid file, temp paths) lives under `/tmp`. Those temp
  paths must stay **one level** below `/tmp` — nginx creates the leaf directory
  at startup but not intermediate parents.
- **HTTP only.** Put a TLS-terminating reverse proxy (Caddy, Traefik, nginx)
  in front and forward to `127.0.0.1:8080`. HSTS belongs on that proxy; there
  is a commented-out `Strict-Transport-Security` line in `docker/nginx.conf`
  for the case where the container itself terminates TLS.
- **Privacy:** the access log deliberately omits the client IP. nginx always
  writes the IP into *error* log entries though (404/403 at `error` level) —
  set `error_log` to `crit` if even those must go.
- **CSP** is strict (`default-src 'none'`, only `'self'` for style/font/img).
  It works because the pages carry no inline `<style>`, no `style=` attributes
  and no JS — keep it that way, or the header needs updating.
- Serves clean URLs (`/impressum` as well as `/impressum.html`), denies
  dotfiles, gzips HTML/CSS/SVG, and exposes `/healthz` for uptime checks.
- **The privacy policy describes this container's logging.** §4 states that the
  webserver access log does not record IP addresses. That is a promise made by
  `docker/nginx.conf` — if the `log_format` ever gains `$remote_addr`, §4 has
  to be corrected in the same commit.

## Git workflow

- Develop on a feature branch (e.g. `claude/...`), commit, push.
- **Direct pushes to `main` are blocked** — open a PR; the owner merges it.
  The PR builds the container image as a check; merging to `main` publishes it
  to GHCR.

## Local preview

No test suite. To verify, open the `.html` files directly in a browser, or take
headless screenshots (Chromium is available). Check both desktop and mobile
widths and that the three page footers stay in sync.

`docker compose up -d --build` serves the site the way the server will
(http://127.0.0.1:8080) — use it whenever a change could interact with the
nginx config, e.g. new asset types, caching, or anything the CSP has to allow.
After editing `docker/nginx.conf`, syntax-check it with
`nginx -t -c "$PWD/docker/nginx.conf"` if nginx is installed locally.

## License

This is **proprietary, all-rights-reserved** software/content (see `LICENSE`).
It is **not** open source — do not add an open-source license or public-domain
dedication, and do not reuse the code/content elsewhere without the owner's
written permission.

## Open TODOs

- The footer year is **hardcoded ("2026")** in all three HTML files — bump it at
  the turn of the year.
- Keep the shared footer ("Made with ❤️ in Lipperode", legal links) identical
  across `index.html`, `impressum.html`, and `datenschutz.html`.
- The Open Graph image is `assets/og-image.jpg` (1200x630); regenerate it if the
  name, role, or portrait changes.
