# garrell-steuerberatung.de

Static business-card site (*Visitenkarte*) for **Ann-Kathrin Garrell**, Steuerberaterin in
Lipperode (Lippstadt). One landing page plus the two legal pages German law requires.

```
index.html          the card: hero, services, focus areas, contact
impressum.html      legal notice (§ 5 DDG)
datenschutz.html    privacy policy
card.css            all styles, shared by the three pages
```

No build step, no framework, no dependencies, no JavaScript. The page works with JS off
because there is none.

## Hard constraint: zero external requests

The site loads **nothing** from the outside — no web fonts, no CDNs, no analytics, no
external images, no cookies. That is what lets it run without a consent banner. For every
change:

- fonts stay **self-hosted** in `assets/fonts/` (Source Sans 3, SIL OFL 1.1, license in
  `OFL.txt`), never hotlinked from Google Fonts or anywhere else
- images live in `assets/` and are referenced with relative paths
- no JavaScript, no `<script>` tags
- no build step, no framework, no npm

Unlike a single-file page, the CSS sits in `card.css` rather than inline — there is no
inline `<style>` and no `style=` attribute anywhere, which is what allows the strict CSP
below to forbid inline styles outright. Keep it that way.

## Content rules

This is the part that makes the repository unusual. German tax advisors are bound by
professional-advertising law (**§ 57a StBerG**, **§§ 9/10 BOStB**), so all visible copy has
to be *sachlich* — factual and non-promotional:

- no superlatives, no self-praise, no comparative claims
- no promises of success or of specific savings, no advertising with waived fees
- no client testimonials — advertising-sensitive and a confidentiality problem at once

The page copy and both legal texts are **German** and stay German; code, comments and
commit messages are English. `datenschutz.html` is written in the first-person singular
(*"Ich"*) because this is a solo practice with no employees — keep any new legal text in
that voice.

The legal pages are business-critical. Preserve meaning and structure when editing, prefer
verbatim client-provided wording, and have substantive changes reviewed by the chamber or a
lawyer before they go live.

### The data-protection chain

`datenschutz.html` §4 describes a specific arrangement, and the text is only correct as long
as it holds: Ann-Kathrin Garrell is the controller, the repository owner is her **processor**
(Art. 28 DS-GVO), and netcup is a **sub-processor** (Art. 28 Abs. 4). netcup is not her
direct processor — she has no contract with them. Cloudflare handles DNS on **grey cloud**
(DNS only), so it never sees website traffic and needs no section of its own; switching the
orange cloud on would make it a TLS terminator and require one.

§4 also states that the webserver access log records no IP addresses. That is a promise made
by `docker/nginx.conf`, not by prose — see below.

## Design

The design system lives in the `:root` custom properties in `card.css`: crimson `#C8102E`,
navy `#1C2234`. Use those variables, do not hardcode colors. `.card`, `.legal-page`,
`.legal-topbar`, `.address` and `.card-footer` are shared across all three pages and have to
stay consistent — the footer in particular ("Made with ❤️ in Lipperode" plus the legal
links) is duplicated three times and drifts easily.

There is no test suite. Verify by opening the files in a browser or taking headless
screenshots, at desktop **and** mobile widths.

## Deployment

The container image is the only deploy path. GitHub Pages served this site before the
cutover and no longer does.

The image is `nginx:1.30-alpine` with the static files baked in — the `Dockerfile` is pure
`COPY`, so `docker/nginx.conf` is the only real logic in it. `COPY *.html` means new pages
are picked up without touching the Dockerfile. It serves **HTTP on port 8080 only**; TLS is
handled by the reverse proxy in front.

```
docker compose up -d --build
curl -I http://127.0.0.1:8080/
```

Prebuilt images are published on every push to `main` (amd64 and arm64) by
`.github/workflows/docker.yml`:

```
docker pull ghcr.io/pklnx/garrell-steuerberatung:latest
```

The package is public, so the server needs no `docker login`.

A few decisions that need explaining in operation:

- **Port 8080, not 80.** The container runs as non-root (`USER nginx`), and unprivileged
  processes may not bind ports below 1024. Everything writable — the pid file, all temp
  paths — therefore lives under `/tmp`. Those paths must stay **one level** below `/tmp`:
  nginx creates the leaf directory at startup but not intermediate parents.
- **Bound to `127.0.0.1`.** The container is reachable on the loopback interface only; the
  reverse proxy on the host forwards to it. Without that binding it would sit on the public
  interface and TLS termination could be bypassed.
- **`read_only: true`** with a `tmpfs` for `/tmp`, all capabilities dropped,
  `no-new-privileges`. Nothing is written at runtime.
- **Health check against `/healthz`.** A separate endpoint keeps health traffic out of the
  page's access log.
- **No client IPs in the access log.** `docker/nginx.conf` uses a `privacy` log format that
  records everything except `$remote_addr`. The error log is the exception: nginx always
  stamps the client IP into it and offers no way to format that away — set `error_log` to
  `crit` if even those must go. **If `log_format` ever gains `$remote_addr`, §4 of
  `datenschutz.html` has to be corrected in the same commit.**
- **Clean URLs.** `/impressum` works as well as `/impressum.html`; dotfiles are denied and
  HTML/CSS/SVG are gzipped.

Rolling back means pinning a tag — use the `YYYYMMDD` tag, not `sha-<commit>`. A scheduled
rebuild builds the same commit again and overwrites its `sha-` tag with a newer nginx, so
that tag identifies the content, not a particular build.

### Reverse proxy examples

nginx on the host:

```nginx
location / {
    proxy_pass http://127.0.0.1:8080;
    proxy_set_header Host              $host;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Caddy:

```
www.garrell-steuerberatung.de {
    reverse_proxy 127.0.0.1:8080
}
```

HSTS belongs on whatever terminates TLS. `docker/nginx.conf` carries a commented-out
`Strict-Transport-Security` line for the case where the container itself becomes the HTTPS
endpoint.

## Keeping the image current

The site changes rarely; the software inside the image does not. Four pieces cover that, and
each only works because the one before it does:

1. **A weekly rebuild** (Mondays 04:00 UTC) rebuilds the unchanged commit, re-resolving
   `nginx:1.30-alpine` to whatever patch release it points at today. `pull: true` on the
   build step forces that re-resolution — a cached base layer would defeat the point.
2. **Dependabot** handles what the schedule cannot: the minor is pinned by hand, so once
   `1.30` goes end-of-life the schedule would keep building a dead branch. Dependabot opens
   a PR for the next stable line.
3. **DIUN on the server** polls the registry and reports when `:latest` points at a new
   digest. It only ever sees what CI publishes, which is why the schedule is a precondition
   for it rather than an alternative — DIUN's silence means "nothing was built", not
   "nothing needs building".
4. **A human pulls.** DIUN notifies, it does not deploy:

   ```
   docker compose pull && docker compose up -d
   ```

Two dependencies worth knowing before changing the workflow:

- `org.opencontainers.image.created` is pinned to the commit date. Left to itself,
  `metadata-action` stamps the build time into the image config and changes the manifest
  digest on every run — DIUN would then report every idle Monday rebuild until nobody reads
  its mail any more. Pinned, an unchanged rebuild is bit-identical and stays quiet.
- GitHub disables scheduled workflows after **60 days without repository activity**, a real
  risk on a site that can go months without an edit. The Dependabot commits are what keep
  the schedule alive.

## Content Security Policy

`docker/nginx.conf` sets a CSP that pins down what the pages already do:

```
default-src 'none'; img-src 'self'; style-src 'self'; font-src 'self';
base-uri 'none'; form-action 'none'; frame-ancestors 'none'
```

This is not decoration but the enforcement of the rule at the top: the moment somebody adds
an external resource, the browser blocks it instead of quietly loading it. Note that
`style-src` is `'self'` without `'unsafe-inline'` — that only holds because the CSS lives
entirely in `card.css`. A single `style=` attribute would break the site under its own
policy. Scripts are forbidden entirely.

If you extend the pages and see a CSP violation in the browser console, you broke the
consent-free operation, you did not misconfigure the CSP.

## License

Proprietary — see [`LICENSE`](LICENSE). Copyright (c) 2026 Ann-Kathrin Garrell, all rights
reserved. Nothing in this repository may be used, copied, or redistributed without prior
written permission.
