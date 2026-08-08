# AG Steuerberatung – static "Visitenkarte" website.
#
# The site is plain HTML/CSS with self-hosted fonts and no build step, so the
# image is nothing but nginx plus the files. Build and run:
#
#   docker build -t ag-steuerberatung .
#   docker run --rm -p 8080:8080 ag-steuerberatung
#
# Bump the base image by changing the minor version below (patch releases are
# picked up automatically on rebuild).
FROM nginx:1.30-alpine

LABEL org.opencontainers.image.title="AG Steuerberatung" \
      org.opencontainers.image.description="Static website of Ann-Kathrin Garrell, Steuerberaterin (Lipperode)" \
      org.opencontainers.image.url="https://www.garrell-steuerberatung.de/" \
      org.opencontainers.image.licenses="LicenseRef-Proprietary"

COPY docker/nginx.conf /etc/nginx/nginx.conf

# The site itself. *.html picks up new pages automatically; .dockerignore keeps
# everything else (docs, workflows, CNAME, LICENSE) out of the web root.
COPY assets/       /usr/share/nginx/html/assets/
COPY *.html        /usr/share/nginx/html/
COPY card.css      /usr/share/nginx/html/

# nginx runs unprivileged on 8080 and keeps its pid file and temp paths in /tmp,
# so the root filesystem can be mounted read-only.
USER nginx
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --spider http://127.0.0.1:8080/healthz || exit 1
