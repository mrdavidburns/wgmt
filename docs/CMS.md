# Content Editor (Sveltia CMS)

The site has a browser-based content editor at
**https://mrdavidburns.github.io/wgmt/admin/**.

It's [Sveltia CMS](https://github.com/sveltia/sveltia-cms) — a git-based CMS.
There is no database: every save is a commit to `main`, which triggers the
GitHub Actions deploy. Editors sign in with their GitHub account and need
**write access to this repo**.

- Admin page: `src/admin/index.html` (copied to `/admin/` at build)
- CMS bundle: self-hosted from the `@sveltia/cms` npm package (no CDN at
  runtime); version is pinned by `package-lock.json`
- Editor config: `src/admin/config.yml` — maps each `src/_data/*.json` file
  to a collection. Root-level JSON arrays use Sveltia's `root: true` list
  option (not supported by Decap, so don't swap the bundle for Decap CMS).
- Uploaded images land in `src/assets/img/`

## Sign in today: personal access token (no setup)

The "Sign In Using Access Token" button works with no OAuth infrastructure:

1. Create a fine-grained PAT at
   https://github.com/settings/personal-access-tokens/new —
   Repository access: **only `mrdavidburns/wgmt`**; Repository permissions:
   **Contents: Read and write**
2. `/admin/` → **Sign In Using Access Token** → paste

Good for repo collaborators. Non-technical editors are better served by the
one-click OAuth flow below.

## Local editing (no auth)

`npm run dev`, open `http://localhost:8080/admin/`, choose **Work with Local
Repository** — edits write straight to the working tree; commit as usual.

## One-time OAuth setup (not yet done)

The "Sign In with GitHub" button needs a tiny OAuth gateway because GitHub
Pages can't run server code. Sveltia provides one as a Cloudflare Worker —
**no domain needs to be on Cloudflare; a free account is enough** (the worker
runs at `*.workers.dev`, the site stays on GitHub Pages). Steps:

1. **Deploy the worker** — go to
   [sveltia/sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth)
   and use the "Deploy to Cloudflare Workers" button (free plan is fine).
   Note the worker URL, e.g. `https://sveltia-cms-auth.<you>.workers.dev`.

2. **Create a GitHub OAuth app** — GitHub → Settings → Developer settings →
   OAuth Apps → New OAuth App:
   - Homepage URL: `https://mrdavidburns.github.io/wgmt/`
   - Authorization callback URL: `<worker URL>/callback`

   Copy the Client ID and generate a Client Secret.

3. **Configure the worker** — in the Cloudflare dashboard, add worker
   environment variables (encrypt the secret):
   - `GITHUB_CLIENT_ID` = the client ID
   - `GITHUB_CLIENT_SECRET` = the client secret
   - `ALLOWED_DOMAINS` = `mrdavidburns.github.io`

4. **Point the CMS at the worker** — in `src/admin/config.yml`, replace the
   `base_url` placeholder with the worker URL. Commit and push.

5. Visit `/admin/`, sign in with GitHub, edit, save. Each save commits to
   `main` and redeploys the site (~1 minute).

When the custom domain goes live, update `ALLOWED_DOMAINS` on the worker and
`site_url` / `display_url` / `logo_url` in `config.yml`.

## Updating the CMS

```bash
npm update @sveltia/cms
```

The bundle is copied from `node_modules` at build time
(see `eleventy.config.js`), so a normal deploy picks up the new version.
