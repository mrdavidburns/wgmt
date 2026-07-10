# Developer Documentation

## Stack

- **[Eleventy 3](https://www.11ty.dev/)** — static site generator, Nunjucks templates
- **No CSS framework** — one hand-written stylesheet (`src/assets/css/main.css`) implementing the design system from the Claude Design prototype
- **Vanilla JS** (`src/assets/js/main.js`) — the site fully works with JS disabled; JS adds mobile nav, stone filtering/favorites, and AJAX form submission
- **GitHub Actions → GitHub Pages** deployment

## Local development

```bash
npm install
npm run dev          # http://localhost:8080, live reload
npm run build        # root-path build → _site/
npm run build:pages  # build exactly like CI (PATH_PREFIX=/wgmt/)
```

Node 22+ (CI uses 22; anything ≥18 works).

## Architecture

### Content = data files

Every piece of repeating content is a JSON file in `src/_data/`, injected into
templates as a global of the same name. This shape is deliberate — each file
maps cleanly to a future CMS collection (see Decap section):

| File | Drives | Notes |
|---|---|---|
| `site.json` | Phone, addresses, hours, Formspree ID | Used by every page |
| `nav.json` | Header navigation | Order matters |
| `stones.json` | Stone Library grid on /countertops/ | `image` empty → striped placeholder from `bg` colors; set `image` to a path under `/assets/img/` to show a photo. `type` must match a filter chip label. |
| `materials.json` | 4-card material teaser on home | |
| `projects.json` | Project grid on /gallery/ | |
| `reviews.json` | /reviews/ + one `featured: true` gets the big dark treatment | |
| `cabinets.json` | Door styles + 3-step process on /cabinets/ | |
| `tile.json` | 6 category cards on /tile/ | Same `image`-or-`bg` behavior as stones |

### Pages

Each page is a Nunjucks template at `src/*.njk` with front matter
(`title`, `description`, `permalink`). Layout chain: page → `layouts/base.njk`.
Shared blocks live in `src/_includes/partials/`. The dark CTA band that closes
most pages is `partials/cross-cta.njk`, parameterized via a `cta` object set
before the include.

### Design system (main.css)

All design tokens are CSS custom properties on `:root`:

- Colors: `--bg` (cream), `--ink` (near-black), `--bronze` / `--bronze-light`
  (accents), `--muted`/`--faint` (text), `--dark-*` (dark-band palette)
- Fonts: `--display` (Libre Caslon Display — headlines), `--serif`
  (Libre Caslon Text — body/lede/quotes), `--sans` (Instrument Sans — UI)
- `--pad-x` is the global horizontal gutter; it shrinks at each breakpoint,
  and every section uses it, so page margins stay consistent

Breakpoints: `1024px` (tablet: 4-col → 2-col, split bands stack),
`900px` (hamburger nav), `680px` (mobile: single column, stacked CTAs).

Fonts are self-hosted subset woff2 (extracted from the design prototype, same
files Google Fonts serves). No external requests at runtime except Formspree
on form submit and the Google Maps directions link.

### Images

`src/assets/img/` holds WebP derivatives (82 quality, ≤1600px) generated from
the original WordPress media library. The full original library and the
mapping of which original produced which derivative live in the companion
asset-prep workspace (not in this repo): `assets/originals/` +
`assets/manifest.csv` + `assets/curated/MAPPING.csv`.

To add an image: drop a WebP in `src/assets/img/`, reference it as
`/assets/img/name.webp` (root-relative — the path prefix is added at build
time). Regenerate from a source photo with:

```bash
sips --resampleWidth 1600 source.jpg --out tmp.jpg
cwebp -q 82 tmp.jpg -o src/assets/img/name.webp
```

### Path prefix (GitHub Pages subpath)

The site lives at `mrdavidburns.github.io/wgmt/` — a subpath. Eleventy's
`HtmlBasePlugin` rewrites every root-relative `href`/`src` at build time using
`PATH_PREFIX` (see `eleventy.config.js`). **Always write URLs root-relative in
templates** (`/countertops/`, `/assets/img/x.webp`); never hardcode `/wgmt/`.

### Switching to the custom domain (wholesalegmt.com)

1. In `.github/workflows/deploy.yml`, change the build step to `PATH_PREFIX=/ npx eleventy`
2. Add a `src/CNAME` file containing `www.wholesalegmt.com` and add
   `eleventyConfig.addPassthroughCopy({ "src/CNAME": "CNAME" })` to the config
   (or just create `CNAME` via the Pages settings UI)
3. Point DNS: `CNAME www → mrdavidburns.github.io`, apex A records to GitHub
   Pages IPs
4. Settings → Pages → Custom domain → enforce HTTPS

### Contact form (Formspree)

`src/contact.njk` posts to `https://formspree.io/f/{{ site.formspreeId }}`.
`site.json` ships with the placeholder `YOUR_FORM_ID` — **the form will not
deliver until this is replaced**:

1. Create a form at [formspree.io](https://formspree.io) (free tier is fine)
2. Put the form ID in `src/_data/site.json` → `formspreeId`
3. In Formspree settings, restrict the allowed domain to the site's domain

JS intercepts the submit and redirects to `/thanks/` on success; with JS
disabled the native POST still works and Formspree shows its own thank-you.

### JavaScript behaviors (main.js)

- **Mobile nav** — toggles `.is-open` + `aria-expanded` on the hamburger
- **Stone filters** — `.chip[data-filter]` buttons hide/show `[data-stone-type]`
  cards and update the count; "All" is default
- **Favorites** — hearts persist stone names to `localStorage` under
  `wgmt-favs`; the banner on /countertops/ updates with the count
- **Form** — AJAX POST with JSON accept header; falls back to a phone-call
  error message on failure

## Deployment

`.github/workflows/deploy.yml`: on push to `main` → checkout, Node 22,
`npm ci`, `PATH_PREFIX=/wgmt/ npx eleventy`, upload `_site/`, deploy with
`actions/deploy-pages`. No secrets required (uses the built-in `GITHUB_TOKEN`
via Pages OIDC).

One-time repo setup: **Settings → Pages → Build and deployment → Source →
GitHub Actions.**

## Planned: Decap CMS (or similar React editor)

The content architecture is already CMS-shaped. When adding Decap:

1. Add `src/admin/index.html` loading the Decap bundle, and
   `src/admin/config.yml` defining one **file collection** per `_data` JSON
   file (Decap edits JSON natively — `format: json`)
2. Passthrough-copy `src/admin` in `eleventy.config.js`
3. Auth on GitHub Pages needs an external OAuth gateway or Decap's GitHub
   backend with a small OAuth proxy (e.g. Cloudflare Worker); Netlify Identity
   is not available here
4. Media: point Decap's `media_folder` at `src/assets/img`

Keep new content in `_data` JSON (not hardcoded in templates) so it stays
editable when the CMS lands.

## Gotchas

- `.card` sets `display:flex`, which would beat the `hidden` attribute's UA
  style — `[hidden]{display:none!important}` in the reset guards this. Keep it.
- The `og:image` meta uses a root-relative path; social scrapers want absolute
  URLs. When the domain is final, switch it to an absolute URL in `base.njk`.
- Photo/caption pairing on /gallery/ and the material cards was matched to the
  best available photos from the old site's media library — worth a client
  review pass before launch.
- The header logo is the old site's 180×180 PNG; a vector rebuild would be
  sharper on retina screens.
