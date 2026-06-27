# Ergophobia

Personal blog — thoughts and project showcases. Built with Hugo (bespoke terminal
theme) and deployed on Cloudflare Workers.

## Develop

```bash
npm install
npm run dev        # hugo server with live reload at http://localhost:1313
```

## Build

```bash
npm run build      # hugo --gc --minify + pagefind -> ./public
npm run check      # validate post/project front matter
npm test           # unit tests (node --test)
```

## Content

- Posts: `content/posts/YYYY-MM-DD-slug.md` (front matter: `title`, `date`, `description`, `tags`).
- Projects: `content/projects/slug.md` (front matter: `title`, `summary`, `status` [active|wip|archived], `repo`, `demo`, `weight`).
- New content: `hugo new posts/my-post.md` or `hugo new projects/my-project.md`.
- Video: `{{</* video youtube="ID" */>}}`, `{{</* video vimeo="ID" */>}}`, or `{{</* video mp4="/path.mp4" */>}}`.

## Theme

Colors live only in `assets/css/main.css` (`:root` dark, `[data-theme="light"]` light).
Dark is the default; the header toggle cycles dark → light → system.

## Deploy (Cloudflare Workers Builds)

The Worker is already connected to `ergofobe/ergophobia-blog` and `ergophobia.org`
points at it (the GitHub Pages cutover is done). Pushing to `main` triggers a build
and deploy; non-`main` branches get a preview URL (`preview_urls: true` in
`wrangler.jsonc`) — verify the redesign on the PR's preview URL before merging.

- **Build command:** `npm run build` (runs `hugo --gc --minify` + Pagefind → `./public`).
  This branch redefines `build` in `package.json`, so the same command builds the new
  Hugo site once merged — no Workers Build config change is needed.
- **Served output:** `./public`, per `wrangler.jsonc` (`html_handling: auto-trailing-slash`,
  `not_found_handling: 404-page`).

### Analytics

Set the Cloudflare Web Analytics token in `hugo.toml` →
`[params.analytics] cloudflare_token = "…"` to enable the cookieless beacon. Empty = off.
