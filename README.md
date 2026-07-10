# Wholesale Granite Marble & Tile

Static site for [wholesalegmt.com](https://www.wholesalegmt.com), built with
[Eleventy](https://www.11ty.dev/) and deployed to GitHub Pages.

**Live:** https://mrdavidburns.github.io/wgmt/

## Quick start

```bash
npm install
npm run dev      # local dev server with live reload → http://localhost:8080
npm run build    # production build → _site/
```

## How it's put together

| Path | What it is |
|---|---|
| `src/_data/*.json` | All site content — business info, stones, projects, reviews, tile categories, cabinet lines |
| `src/*.njk` | One template per page (home, countertops, cabinets, tile, gallery, reviews, about, contact, thanks, 404) |
| `src/_includes/layouts/base.njk` | HTML shell: head, header, footer |
| `src/_includes/partials/` | Topbar, header/nav, footer, cross-page CTA band |
| `src/assets/css/main.css` | The whole design system — tokens, components, responsive rules |
| `src/assets/js/main.js` | Progressive enhancement: mobile nav, stone filters + favorites, AJAX form |
| `src/assets/img/` | Optimized WebP images (sourced from the original site's media library) |
| `src/assets/fonts/` | Self-hosted woff2: Libre Caslon Display/Text + Instrument Sans |
| `.github/workflows/deploy.yml` | Builds and deploys to GitHub Pages on push to `main` |

Full developer documentation: **[docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)** —
covers content editing, the path-prefix setup, the Formspree contact form,
custom-domain switch, and the planned Decap CMS integration.

## Editing content (no code required)

Business facts (phone, hours, addresses) live in `src/_data/site.json`.
Stones, gallery projects, reviews, tile categories, and cabinet door styles are
each a JSON file in `src/_data/`. Edit, commit, push — the site redeploys
automatically.

## Deploy

Push to `main`. GitHub Actions builds with `PATH_PREFIX=/wgmt/` and publishes
via GitHub Pages. First-time repo setup: Settings → Pages → Source →
**GitHub Actions**.
