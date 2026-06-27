# Ergophobia Hugo Terminal Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-platform the Ergophobia personal blog from Eleventy/GitHub Pages to Hugo/Cloudflare Workers with a bespoke dark-first "terminal" theme, a projects showcase, search, RSS, and video embeds.

**Architecture:** Hugo Extended static site with a bespoke theme written directly in `layouts/`. The design system is CSS custom-property tokens in `assets/css/main.css` (`:root` dark, `[data-theme="light"]` light). Content is English-only across `content/posts/` and a `content/projects/` content type. Build runs `hugo --gc --minify` then Pagefind; output in `./public` is served by Cloudflare Workers Builds via `wrangler.jsonc`.

**Tech Stack:** Hugo Extended ≥ 0.163.x, Node ≥ 22, Pagefind 1.x, JetBrains Mono + Inter (self-hosted woff2), Cloudflare Workers Builds, Cloudflare Web Analytics.

## Global Constraints

- **Hugo Extended only** (SCSS/asset pipeline + fingerprinting are used). Local dev and CI both use Hugo Extended.
- **English only.** No i18n, no `defaultContentLanguageInSubdir`, no language subdirs.
- **baseURL:** `https://ergophobia.org/` in `hugo.toml`; production build on `main` uses it, all other builds use `--baseURL "/"`.
- **Colors live only in `assets/css/main.css`** as CSS custom properties. Dark is default (`:root`); light is `[data-theme="light"]`.
- **No third-party network requests at runtime.** Fonts are self-hosted woff2. The only optional external beacon is Cloudflare Web Analytics, rendered only when its token param is set.
- **Author:** Jim. **Footer:** `© 2026 Ergophobia`. **Wordmark:** `~/ergophobia` (mono).
- **Accent colors:** primary green `--accent` (`#3ee08f` dark / `#1f9d57` light), secondary amber `--accent-2` (`#f0b429` dark / `#b07a12` light).
- **Commit after every task.** Each task ends green (`npm run build` exits 0).

---

## File Structure

| File | Responsibility |
|---|---|
| `hugo.toml` | Site config: title, baseURL, taxonomies, outputs, params |
| `package.json` | Scripts (`dev`/`build`/`check`/`test`) + pagefind dep |
| `wrangler.jsonc` | Cloudflare Workers static-assets config |
| `.gitignore` | Ignore `public/`, `resources/`, `node_modules/`, lock |
| `archetypes/{posts,projects}.md` | New-content templates |
| `content/_index.md` | Home hero copy (params) |
| `content/{about,search}.md` | About + Pagefind UI pages |
| `content/posts/*.md` | Blog posts (3 migrated) |
| `content/projects/*.md` | Project entries (3 seeded) |
| `layouts/_default/baseof.html` | HTML shell |
| `layouts/partials/*.html` | head, header, footer, post-row, project-row, theme-toggle, search, analytics |
| `layouts/index.html` | Home: hero + recent posts + projects teaser |
| `layouts/_default/{list,single}.html` | Post list + single |
| `layouts/projects/{list,single}.html` | Projects listing + detail |
| `layouts/_default/search.html` | Pagefind page |
| `layouts/shortcodes/video.html` | MP4/YouTube/Vimeo embed |
| `layouts/404.html`, `layouts/robots.txt` | Error page + robots |
| `assets/css/main.css` | Tokenized design system (dark + light) |
| `assets/js/theme.js` | Theme cycle dark→light→system |
| `static/fonts/*.woff2` | Self-hosted fonts |
| `static/img/*` | Favicon, OG image, post cover |
| `scripts/cf-build.sh` | Production build pipeline |
| `scripts/check-content.mjs` + `.test.mjs` | Front-matter/asset validation |
| `.github/workflows/ci.yml` | CI build + tests |

---

## Task 1: Scaffold Hugo project and remove the Eleventy/Docker/Pages toolchain

**Files:**
- Create: `hugo.toml`, `package.json` (replace), `.gitignore` (replace), `archetypes/posts.md`, `archetypes/projects.md`
- Delete: `.eleventy.js`, `.eleventyignore`, `_includes/`, `index.njk`, `404.njk`, `styles/`, `posts/posts.json`, `examples/`, `Dockerfile`, `Dockerfile.dev`, `docker-compose.yml`, `.dockerignore`, `.github/workflows/deploy.yml`, `package-lock.json`
- Keep for now: `posts/*.md` and `assets/peaceful-workspace.webp` (migrated in Task 4), `README.md`, `AGENTS.md`

**Interfaces:**
- Produces: a buildable empty Hugo site; `hugo.toml` params `description`, `tagline`, `analytics.cloudflare_token`, `search.enabled`; taxonomies `tags`; outputs `home = ["HTML","RSS"]`.

- [ ] **Step 1: Remove the old toolchain**

```bash
cd "$(git rev-parse --show-toplevel)"
git rm -r --quiet .eleventy.js .eleventyignore _includes index.njk 404.njk styles posts/posts.json examples Dockerfile Dockerfile.dev docker-compose.yml .dockerignore .github/workflows/deploy.yml package-lock.json
```

- [ ] **Step 2: Write `hugo.toml`**

```toml
baseURL = "https://ergophobia.org/"
languageCode = "en-us"
title = "Ergophobia"
enableRobotsTXT = true
summaryLength = 40
timeZone = "America/New_York"

[pagination]
  pagerSize = 12

[taxonomies]
  tag = "tags"

[markup]
  [markup.goldmark.renderer]
    unsafe = true
  [markup.highlight]
    noClasses = false
    lineNos = false

[outputs]
  home = ["HTML", "RSS"]

[params]
  description = "A quiet corner of the internet — thoughts without the algorithm, and the projects I'm building."
  tagline = "high-tech redneck · thoughts & projects"
  author = "Jim"
  [params.search]
    enabled = true
  [params.analytics]
    cloudflare_token = ""   # set to the Cloudflare Web Analytics token to enable the beacon
```

- [ ] **Step 3: Write `package.json`**

```json
{
  "name": "ergophobia-blog",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "hugo server -D --navigateToChanged",
    "build": "sh scripts/cf-build.sh",
    "check": "node scripts/check-content.mjs content",
    "test": "node --test"
  },
  "devDependencies": {
    "pagefind": "^1.1.0"
  }
}
```

- [ ] **Step 4: Write `.gitignore`**

```gitignore
.DS_Store
node_modules/
public/
resources/
.hugo_build.lock
```

- [ ] **Step 5: Write `archetypes/posts.md`**

```markdown
---
title: "{{ replace .Name "-" " " | title }}"
date: {{ .Date }}
description: ""
tags: []
draft: true
---
```

- [ ] **Step 6: Write `archetypes/projects.md`**

```markdown
---
title: "{{ replace .Name "-" " " | title }}"
date: {{ .Date }}
summary: ""
status: "active"
repo: ""
demo: ""
weight: 50
tags: []
---
```

- [ ] **Step 7: Verify the site builds empty**

Run: `hugo --gc --baseURL "/"`
Expected: exit 0, output `Pages` built, `public/index.html` exists (will be unstyled — no templates yet, Hugo emits nothing for home without a layout; the command still exits 0).

Run: `test -d public && echo OK`
Expected: `OK`

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: scaffold Hugo project, remove Eleventy/Docker/Pages toolchain"
```

---

## Task 2: Base shell, design tokens, self-hosted fonts, and theme toggle

**Files:**
- Create: `static/fonts/` (6 woff2), `assets/css/main.css`, `assets/js/theme.js`, `layouts/_default/baseof.html`, `layouts/partials/head.html`, `layouts/partials/header.html`, `layouts/partials/footer.html`, `layouts/partials/theme-toggle.html`
- Create stub (filled later): `layouts/partials/analytics.html` (empty file), `layouts/partials/search.html` (empty file)

**Interfaces:**
- Produces: `baseof.html` defines block `main`; design tokens `--bg,--panel,--line,--ink,--muted,--accent,--accent-2,--font-mono,--font-sans,--maxw,--maxw-wide,--radius`; `#theme-toggle` button; CSS classes `.wrap`, `.site-header`, `.brand`, `.nav`, `.iconbtn`, `.site-footer` consumed by later tasks.

- [ ] **Step 1: Download self-hosted fonts**

```bash
mkdir -p static/fonts
base="https://cdn.jsdelivr.net/fontsource/fonts"
curl -sSLo static/fonts/inter-400.woff2 "$base/inter@latest/latin-400-normal.woff2"
curl -sSLo static/fonts/inter-500.woff2 "$base/inter@latest/latin-500-normal.woff2"
curl -sSLo static/fonts/inter-600.woff2 "$base/inter@latest/latin-600-normal.woff2"
curl -sSLo static/fonts/jbmono-400.woff2 "$base/jetbrains-mono@latest/latin-400-normal.woff2"
curl -sSLo static/fonts/jbmono-500.woff2 "$base/jetbrains-mono@latest/latin-500-normal.woff2"
curl -sSLo static/fonts/jbmono-700.woff2 "$base/jetbrains-mono@latest/latin-700-normal.woff2"
ls -l static/fonts
```

Expected: 6 non-empty `.woff2` files (each > 10 KB).

- [ ] **Step 2: Write `assets/css/main.css`**

```css
/* ===== Fonts ===== */
@font-face{font-family:Inter;src:url(/fonts/inter-400.woff2) format("woff2");font-weight:400;font-display:swap}
@font-face{font-family:Inter;src:url(/fonts/inter-500.woff2) format("woff2");font-weight:500;font-display:swap}
@font-face{font-family:Inter;src:url(/fonts/inter-600.woff2) format("woff2");font-weight:600;font-display:swap}
@font-face{font-family:"JetBrains Mono";src:url(/fonts/jbmono-400.woff2) format("woff2");font-weight:400;font-display:swap}
@font-face{font-family:"JetBrains Mono";src:url(/fonts/jbmono-500.woff2) format("woff2");font-weight:500;font-display:swap}
@font-face{font-family:"JetBrains Mono";src:url(/fonts/jbmono-700.woff2) format("woff2");font-weight:700;font-display:swap}

/* ===== Tokens: dark (default) ===== */
:root{
  --bg:#0b0f14; --panel:#11171f; --line:#1e2730; --ink:#d7e0e8; --muted:#6d7c8a;
  --accent:#3ee08f; --accent-2:#f0b429;
  --font-mono:"JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,monospace;
  --font-sans:Inter,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;
  --maxw:860px; --maxw-wide:1080px; --radius:10px;
  --glow:radial-gradient(900px 500px at 80% -10%,rgba(62,224,143,.08),transparent 60%);
}
[data-theme="light"]{
  --bg:#f7f4ea; --panel:#fffdf6; --line:#e6e0cf; --ink:#3a3a32; --muted:#8a8472;
  --accent:#1f9d57; --accent-2:#b07a12;
  --glow:radial-gradient(900px 500px at 80% -10%,rgba(31,157,87,.07),transparent 60%);
}

/* ===== Base ===== */
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:var(--glow),var(--bg);background-attachment:fixed;color:var(--ink);
  font-family:var(--font-sans);font-size:16px;line-height:1.65;-webkit-font-smoothing:antialiased;}
a{color:var(--accent);text-decoration:none}
a:hover{text-decoration:underline}
:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
img{max-width:100%;height:auto}
.wrap{max-width:var(--maxw-wide);margin:0 auto;padding:0 24px}
.reading{max-width:var(--maxw)}

/* ===== Header ===== */
.site-header{border-bottom:1px solid var(--line)}
.site-header .wrap{display:flex;align-items:center;justify-content:space-between;height:64px}
.brand{font-family:var(--font-mono);font-weight:700;font-size:18px;letter-spacing:-.02em;color:var(--ink)}
.brand .c{color:var(--muted)} .brand .p{color:var(--accent)}
.nav{display:flex;align-items:center;gap:6px;font-family:var(--font-mono);font-size:13px}
.nav a{color:var(--muted);padding:6px 10px;border:1px solid transparent;border-radius:6px}
.nav a:hover{color:var(--ink);border-color:var(--line);text-decoration:none}
.nav a[aria-current="page"]{color:var(--accent);border-color:var(--line);background:var(--panel)}
.iconbtn{font-family:var(--font-mono);font-size:13px;background:var(--panel);color:var(--muted);
  border:1px solid var(--line);border-radius:6px;padding:6px 10px;cursor:pointer}
.iconbtn:hover{color:var(--ink)}

/* ===== Hero ===== */
.hero{padding:52px 0 26px}
.hero .promptline{font-family:var(--font-mono);color:var(--muted);font-size:14px}
.hero .promptline .g{color:var(--accent)}
.hero h1{font-family:var(--font-mono);font-weight:700;font-size:clamp(26px,4.6vw,34px);line-height:1.16;
  letter-spacing:-.02em;margin:14px 0 10px}
.hero h1 .hl{color:var(--accent)}
.hero p{color:var(--muted);max-width:640px;margin:0}
.cursor{display:inline-block;width:9px;height:1em;background:var(--accent);vertical-align:-2px;
  margin-left:3px;animation:blink 1.1s steps(1) infinite}
@keyframes blink{50%{opacity:0}}

/* ===== Section labels ===== */
.sec-label{font-family:var(--font-mono);font-size:12px;color:var(--muted);text-transform:uppercase;
  letter-spacing:.18em;margin:36px 0 14px;display:flex;align-items:center;gap:12px}
.sec-label::after{content:"";flex:1;height:1px;background:var(--line)}
.sec-label a{margin-left:auto;letter-spacing:normal;text-transform:none;font-size:13px}

/* ===== Rows (posts + projects) ===== */
.row{display:grid;grid-template-columns:118px 1fr auto;gap:18px;align-items:center;
  padding:16px;border:1px solid var(--line);border-radius:var(--radius);background:var(--panel);
  margin-bottom:12px}
.row:hover{border-color:var(--accent);text-decoration:none}
.row .date{font-family:var(--font-mono);color:var(--muted);font-size:13px}
.row h3{margin:0 0 4px;font-size:18px;color:var(--ink);font-weight:600}
.row p{margin:0;color:var(--muted);font-size:14px}
.pill{font-family:var(--font-mono);font-size:11px;padding:3px 9px;border-radius:999px;
  border:1px solid var(--line);color:var(--accent);white-space:nowrap}
.pill.amber{color:var(--accent-2)}
.led{display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--accent);margin-right:7px}
.led.amber{background:var(--accent-2)} .led.muted{background:var(--muted)}
.status{font-family:var(--font-mono);font-size:12px;color:var(--muted);display:flex;align-items:center}
@media(max-width:600px){.row{grid-template-columns:1fr;gap:6px}.row .date{order:-1}}

/* ===== Article ===== */
.article{padding:34px 0 10px}
.article .kicker{font-family:var(--font-mono);font-size:12px;text-transform:uppercase;
  letter-spacing:.14em;color:var(--accent-2)}
.article h1{font-family:var(--font-mono);font-weight:700;font-size:clamp(26px,4.4vw,34px);
  line-height:1.18;letter-spacing:-.02em;margin:10px 0 8px}
.article .byline{font-family:var(--font-mono);color:var(--muted);font-size:13px;margin-bottom:26px}
.prose{font-size:17px}
.prose h2{font-family:var(--font-mono);font-size:22px;margin:34px 0 10px;letter-spacing:-.01em}
.prose h3{font-family:var(--font-mono);font-size:18px;margin:26px 0 8px}
.prose a{text-decoration:underline}
.prose img{border-radius:var(--radius);border:1px solid var(--line);margin:22px 0}
.prose pre{background:var(--panel);border:1px solid var(--line);border-radius:var(--radius);
  padding:14px 16px;overflow:auto;font-family:var(--font-mono);font-size:14px}
.prose code{font-family:var(--font-mono);font-size:.92em}
.prose :not(pre)>code{background:var(--panel);border:1px solid var(--line);border-radius:5px;padding:.1em .35em}
.prose blockquote{border-left:3px solid var(--accent);margin:18px 0;padding:2px 0 2px 16px;color:var(--muted)}
.tags{display:flex;flex-wrap:wrap;gap:8px;margin:30px 0;font-family:var(--font-mono)}
.tags a{font-size:12px;color:var(--accent);border:1px solid var(--line);border-radius:999px;padding:3px 10px}

/* ===== Video shortcode ===== */
.video{position:relative;aspect-ratio:16/9;margin:22px 0;border-radius:var(--radius);
  overflow:hidden;border:1px solid var(--line);background:#000}
.video iframe,.video video{position:absolute;inset:0;width:100%;height:100%;border:0}

/* ===== Footer ===== */
.site-footer{border-top:1px solid var(--line);margin-top:48px;padding:24px 0 56px;
  font-family:var(--font-mono);font-size:13px;color:var(--muted)}
.site-footer .g{color:var(--accent)}
.site-footer a{color:var(--muted)} .site-footer a:hover{color:var(--ink)}

/* ===== Pagefind ===== */
:root{--pagefind-ui-primary:var(--accent);--pagefind-ui-background:var(--panel);
  --pagefind-ui-text:var(--ink);--pagefind-ui-border:var(--line);--pagefind-ui-font:var(--font-sans)}
```

- [ ] **Step 3: Write `assets/js/theme.js`**

```javascript
(function () {
  var order = ["dark", "light", "system"];
  var labels = { dark: "☾ dark", light: "☀ light", system: "⌘ system" };
  function effective(p) {
    if (p === "system") return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    return p;
  }
  function apply(p) {
    document.documentElement.setAttribute("data-theme", effective(p));
    document.documentElement.setAttribute("data-theme-pref", p);
    var b = document.getElementById("theme-toggle");
    if (b) { b.textContent = labels[p]; b.setAttribute("aria-label", "Theme: " + p); }
  }
  function current() { return localStorage.getItem("theme") || "dark"; }
  window.addEventListener("DOMContentLoaded", function () {
    apply(current());
    var b = document.getElementById("theme-toggle");
    if (b) b.addEventListener("click", function () {
      var n = order[(order.indexOf(current()) + 1) % order.length];
      localStorage.setItem("theme", n); apply(n);
    });
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () {
      if (current() === "system") apply("system");
    });
  });
})();
```

- [ ] **Step 4: Write empty partial stubs**

Create `layouts/partials/analytics.html` and `layouts/partials/search.html` as empty files (filled in Tasks 9 and 7):

```bash
mkdir -p layouts/partials
: > layouts/partials/analytics.html
: > layouts/partials/search.html
```

- [ ] **Step 5: Write `layouts/partials/head.html`**

```go-html-template
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script>
(function(){try{var t=localStorage.getItem('theme')||'dark';var m=window.matchMedia('(prefers-color-scheme: dark)').matches;var d=t==='dark'||(t==='system'&&m);document.documentElement.setAttribute('data-theme',d?'dark':'light');document.documentElement.setAttribute('data-theme-pref',t);}catch(e){}})();
</script>
<title>{{ if .IsHome }}{{ .Site.Title }} — {{ .Site.Params.tagline }}{{ else }}{{ .Title }} · {{ .Site.Title }}{{ end }}</title>
<meta name="description" content="{{ with .Description }}{{ . }}{{ else }}{{ if .IsPage }}{{ .Summary | plainify | truncate 160 }}{{ else }}{{ .Site.Params.description }}{{ end }}{{ end }}">
<link rel="canonical" href="{{ .Permalink }}">
{{ $css := resources.Get "css/main.css" | resources.Minify | resources.Fingerprint "sha256" }}
<link rel="stylesheet" href="{{ $css.RelPermalink }}" integrity="{{ $css.Data.Integrity }}">
<link rel="icon" href="/img/favicon.svg" type="image/svg+xml">
{{ template "_internal/opengraph.html" . }}
<meta name="twitter:card" content="summary_large_image">
{{ with .OutputFormats.Get "rss" }}<link rel="alternate" type="application/rss+xml" href="{{ .Permalink }}" title="{{ $.Site.Title }}">{{ end }}
{{ partial "analytics.html" . }}
```

- [ ] **Step 6: Write `layouts/partials/theme-toggle.html`**

```go-html-template
<button id="theme-toggle" class="iconbtn" type="button" aria-label="Toggle theme">☾ dark</button>
```

- [ ] **Step 7: Write `layouts/partials/header.html`**

```go-html-template
<header class="site-header"><div class="wrap">
  <a class="brand" href="/"><span class="c">~/</span><span class="p">ergophobia</span></a>
  <nav class="nav" aria-label="Primary">
    <a href="/posts/" {{ if hasPrefix .RelPermalink "/posts" }}aria-current="page"{{ end }}>posts</a>
    <a href="/projects/" {{ if hasPrefix .RelPermalink "/projects" }}aria-current="page"{{ end }}>projects</a>
    <a href="/about/" {{ if eq .RelPermalink "/about/" }}aria-current="page"{{ end }}>about</a>
    {{ if .Site.Params.search.enabled }}<a href="/search/">./search</a>{{ end }}
    {{ partial "theme-toggle.html" . }}
  </nav>
</div></header>
```

- [ ] **Step 8: Write `layouts/partials/footer.html`**

```go-html-template
<footer class="site-footer"><div class="wrap">
  <span class="g">$</span> © 2026 Ergophobia &nbsp;·&nbsp; built by {{ .Site.Params.author }} &nbsp;·&nbsp;
  <a href="/index.xml">rss</a> &nbsp;·&nbsp; hugo + cloudflare
</div></footer>
```

- [ ] **Step 9: Write `layouts/_default/baseof.html`**

```go-html-template
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>{{ partial "head.html" . }}</head>
<body>
  {{ partial "header.html" . }}
  <main id="main">{{ block "main" . }}{{ end }}</main>
  {{ partial "footer.html" . }}
  <script src="{{ (resources.Get "js/theme.js" | resources.Minify | resources.Fingerprint "sha256").RelPermalink }}" defer></script>
</body>
</html>
```

- [ ] **Step 10: Add a temporary home layout to verify the shell, then build**

Create `layouts/index.html` with a placeholder (replaced in Task 3):

```go-html-template
{{ define "main" }}<div class="wrap"><p>home</p></div>{{ end }}
```

Run: `hugo --gc --baseURL "/"`
Expected: exit 0.

Run: `grep -q "~/" public/index.html && grep -q "theme-toggle" public/index.html && echo OK`
Expected: `OK`

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: terminal theme shell, design tokens, self-hosted fonts, theme toggle"
```

---

## Task 3: Home page — whoami hero, recent posts, projects teaser

**Files:**
- Create: `content/_index.md`
- Modify: `layouts/index.html` (replace placeholder)
- Create: `layouts/partials/post-row.html`, `layouts/partials/project-row.html`

**Interfaces:**
- Consumes: `.wrap`, `.hero`, `.sec-label`, `.row` classes (Task 2).
- Produces: `partials/post-row.html` (takes a post Page as `.`), `partials/project-row.html` (takes a project Page as `.`) — both reused by Tasks 4 and 5.

- [ ] **Step 1: Write `content/_index.md`**

```markdown
---
hero_prompt: "jim@ergophobia:~$ whoami"
hero_line: "High-tech redneck. I [stack sats], build tools, and write the signal down."
hero_sub: "No memes, no ragebait — a personal log of thoughts and the projects I'm shipping. Everything lives here, nowhere else."
---
```

- [ ] **Step 2: Write `layouts/partials/post-row.html`**

```go-html-template
<a class="row" href="{{ .RelPermalink }}">
  <span class="date">{{ .Date.Format "2006-01-02" }}</span>
  <div><h3>{{ .Title }}</h3><p>{{ with .Description }}{{ . }}{{ else }}{{ .Summary | plainify | truncate 120 }}{{ end }}</p></div>
  {{ with index .Params.tags 0 }}<span class="pill">#{{ . }}</span>{{ end }}
</a>
```

- [ ] **Step 3: Write `layouts/partials/project-row.html`**

```go-html-template
{{ $s := .Params.status | default "active" }}
<a class="row" href="{{ .RelPermalink }}">
  <span class="status"><span class="led {{ if eq $s "wip" }}amber{{ else if eq $s "archived" }}muted{{ end }}"></span>{{ $s }}</span>
  <div><h3>{{ .Title }}</h3><p>{{ .Params.summary }}</p></div>
  <span class="pill {{ if eq $s "wip" }}amber{{ end }}">project</span>
</a>
```

- [ ] **Step 4: Write `layouts/index.html`**

```go-html-template
{{ define "main" }}
<section class="wrap hero">
  <div class="promptline"><span class="g">{{ index (split .Params.hero_prompt ":") 0 }}</span>:{{ index (split .Params.hero_prompt ":") 1 }}</div>
  <h1>{{ .Params.hero_line | replaceRE `\[(.+?)\]` `<span class="hl">$1</span>` | safeHTML }}<span class="cursor"></span></h1>
  <p>{{ .Params.hero_sub }}</p>
</section>

<div class="wrap">
  <div class="sec-label">recent posts <a href="/posts/">all posts →</a></div>
  {{ range first 5 (where .Site.RegularPages "Section" "posts") }}{{ partial "post-row.html" . }}{{ end }}

  <div class="sec-label">projects <a href="/projects/">all projects →</a></div>
  {{ range first 3 (sort (where .Site.RegularPages "Section" "projects") "Weight") }}{{ partial "project-row.html" . }}{{ end }}
</div>
{{ end }}
```

- [ ] **Step 5: Build and verify hero renders**

Run: `hugo --gc --baseURL "/"`
Expected: exit 0.

Run: `grep -q "whoami" public/index.html && grep -q 'class="hl">stack sats' public/index.html && echo OK`
Expected: `OK`

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: home page with whoami hero, recent posts, projects teaser"
```

---

## Task 4: Posts — list, single, and migrate the three existing posts

**Files:**
- Create: `layouts/_default/list.html`, `layouts/_default/single.html`
- Create: `content/posts/_index.md`
- Move + rewrite front matter: `posts/2026-01-09-intro.md` → `content/posts/2026-01-09-welcome-to-ergophobia.md`; `posts/2026-01-18-xrpl-sweep.md` → `content/posts/2026-01-18-sweeping-xrp-nodejs-tool.md`; `posts/2026-02-01-social-intel.md` → `content/posts/2026-02-01-daily-social-intelligence-report.md`
- Move image: `assets/peaceful-workspace.webp` → `static/img/peaceful-workspace.webp`
- Delete: `posts/` (after move)

**Interfaces:**
- Consumes: `partial "post-row.html"` (Task 3), `.article`, `.prose`, `.tags` classes (Task 2).
- Produces: `/posts/` list page and per-post pages with `data-pagefind-body` on the article body (consumed by Pagefind in Task 7).

- [ ] **Step 1: Write `content/posts/_index.md`**

```markdown
---
title: "Posts"
description: "Thoughts, write-ups, and signal — published here and nowhere else."
---
```

- [ ] **Step 2: Write `layouts/_default/list.html`**

```go-html-template
{{ define "main" }}
<div class="wrap">
  <div class="sec-label">{{ .Title | lower }}</div>
  {{ $pages := .Paginate (.Pages.ByDate.Reverse) }}
  {{ range $pages.Pages }}{{ partial "post-row.html" . }}{{ end }}
  {{ template "_internal/pagination.html" . }}
</div>
{{ end }}
```

- [ ] **Step 3: Write `layouts/_default/single.html`**

```go-html-template
{{ define "main" }}
<article class="wrap reading article">
  {{ with index .Params.tags 0 }}<div class="kicker">{{ . }}</div>{{ end }}
  <h1>{{ .Title }}</h1>
  <div class="byline">{{ .Date.Format "January 2, 2006" }} · {{ .ReadingTime }} min · {{ .Site.Params.author }}</div>
  <div class="prose" data-pagefind-body>{{ .Content }}</div>
  {{ with .Params.tags }}<div class="tags">{{ range . }}<a href="/tags/{{ . | urlize }}/">#{{ . }}</a>{{ end }}</div>{{ end }}
</article>
{{ end }}
```

- [ ] **Step 4: Move the image**

```bash
mkdir -p static/img
git mv assets/peaceful-workspace.webp static/img/peaceful-workspace.webp
```

- [ ] **Step 5: Migrate the intro post**

```bash
mkdir -p content/posts
git mv posts/2026-01-09-intro.md content/posts/2026-01-09-welcome-to-ergophobia.md
```

Replace its front matter block (everything between the first pair of `---`) with:

```yaml
---
title: "Welcome to Ergophobia"
date: 2026-01-09T21:50:00
description: "A quiet corner of the internet for thoughts without the noise of social media."
tags: [meta]
---
```

Then in the body, update the image path from `/assets/peaceful-workspace.webp` to `/img/peaceful-workspace.webp`. Leave all prose unchanged.

- [ ] **Step 6: Migrate the xrpl-sweep post**

```bash
git mv posts/2026-01-18-xrpl-sweep.md content/posts/2026-01-18-sweeping-xrp-nodejs-tool.md
```

Replace its front matter with (drop `layout` and `author`; keep tags):

```yaml
---
title: "Sweeping XRP with a Simple Node.js Tool – Recover Your Reserve in Minutes"
date: 2026-01-18T18:43:00
description: "A secure CLI tool to sweep XRP from any BIP-39 mnemonic wallet and reclaim most of the 1 XRP account reserve using AccountDelete."
tags: [project, xrp, cli]
---
```

Leave the body unchanged.

- [ ] **Step 7: Migrate the social-intel post**

```bash
git mv posts/2026-02-01-social-intel.md content/posts/2026-02-01-daily-social-intelligence-report.md
```

Replace its front matter with:

```yaml
---
title: "Daily Social Intelligence Report – February 01, 2026"
date: 2026-02-01T13:36:07
description: "Curated high-signal insights from X, web sources, and communities on crypto, tech, liberty, animal ethics, and more."
tags: [signal]
---
```

Leave the body unchanged.

- [ ] **Step 8: Remove the now-empty old posts directory**

```bash
rmdir posts 2>/dev/null || true
test ! -d posts && echo "posts removed"
```

- [ ] **Step 9: Build and verify posts render**

Run: `hugo --gc --baseURL "/"`
Expected: exit 0.

Run: `grep -rq "data-pagefind-body" public/posts/2026-01-09-welcome-to-ergophobia/index.html && grep -q "Welcome to Ergophobia" public/posts/index.html && echo OK`
Expected: `OK`

Run: `grep -q "/img/peaceful-workspace.webp" public/posts/2026-01-09-welcome-to-ergophobia/index.html && echo IMG_OK`
Expected: `IMG_OK`

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: post list + single templates, migrate 3 posts to Hugo"
```

---

## Task 5: Projects content type — terminal listing, detail pages, seed three projects

**Files:**
- Create: `content/projects/_index.md`, `content/projects/xrpl-sweep.md`, `content/projects/ergophobia.md`, `content/projects/social-intel.md`
- Create: `layouts/projects/list.html`, `layouts/projects/single.html`

**Interfaces:**
- Consumes: `partial "project-row.html"` (Task 3), `.wrap`, `.sec-label`, `.prose` classes.
- Produces: `/projects/` listing rendered as a terminal `ls`, plus `/projects/<name>/` detail pages.

- [ ] **Step 1: Write `content/projects/_index.md`**

```markdown
---
title: "Projects"
description: "Tools and things I'm building — most are open source."
---
```

- [ ] **Step 2: Write the three project entries**

`content/projects/xrpl-sweep.md`:

```markdown
---
title: "xrpl-sweep"
date: 2026-01-18
summary: "CLI to recover XRP account reserves from any BIP-39 mnemonic via AccountDelete."
status: "active"
repo: "https://github.com/ergofobe/xrpl-sweep"
demo: ""
weight: 10
tags: [xrp, cli]
---

A small, secure Node.js command-line tool that imports a BIP-39 mnemonic and
sweeps XRP from the XRP Ledger, reclaiming most of the 1 XRP account reserve
using `AccountDelete`. See the [full write-up](/posts/2026-01-18-sweeping-xrp-nodejs-tool/).
```

`content/projects/ergophobia.md`:

```markdown
---
title: "ergophobia"
date: 2026-06-27
summary: "This blog — a bespoke Hugo terminal theme deployed on Cloudflare Workers."
status: "active"
repo: "https://github.com/ergofobe/ergophobia-blog"
demo: "https://ergophobia.org"
weight: 20
tags: [hugo, cloudflare]
---

The site you're reading. Hugo Extended, a hand-built dark-first terminal theme,
Pagefind search, and Cloudflare Workers Builds deployment.
```

`content/projects/social-intel.md`:

```markdown
---
title: "social-intel"
date: 2026-02-01
summary: "Automated daily signal digest — high-signal insights pulled and curated from across the web."
status: "wip"
repo: "https://github.com/ergofobe/ergophobia-blog"
demo: ""
weight: 30
tags: [automation, ai]
---

A pipeline that gathers and curates high-conviction signals on crypto, tech,
liberty, and ethics into a daily report. See the [latest report](/posts/2026-02-01-daily-social-intelligence-report/).
```

- [ ] **Step 3: Write `layouts/projects/list.html`**

```go-html-template
{{ define "main" }}
<div class="wrap">
  <div class="sec-label">~/ergophobia $ ls projects/</div>
  {{ range sort .Pages "Weight" }}
  <a class="row" href="{{ .RelPermalink }}">
    {{ $s := .Params.status | default "active" }}
    <span class="status"><span class="led {{ if eq $s "wip" }}amber{{ else if eq $s "archived" }}muted{{ end }}"></span>{{ $s }}</span>
    <div><h3>{{ .Title }}</h3><p>{{ .Params.summary }}</p></div>
    <span class="status" style="gap:14px">
      {{ with .Params.repo }}<a href="{{ . }}">↗repo</a>{{ end }}
      {{ with .Params.demo }}&nbsp;<a href="{{ . }}">↗demo</a>{{ end }}
    </span>
  </a>
  {{ end }}
</div>
{{ end }}
```

- [ ] **Step 4: Write `layouts/projects/single.html`**

```go-html-template
{{ define "main" }}
<article class="wrap reading article">
  <div class="kicker">project · {{ .Params.status | default "active" }}</div>
  <h1>{{ .Title }}</h1>
  <div class="byline">
    {{ with .Params.repo }}<a href="{{ . }}">↗ repo</a>{{ end }}
    {{ with .Params.demo }} &nbsp;·&nbsp; <a href="{{ . }}">↗ demo</a>{{ end }}
  </div>
  <div class="prose" data-pagefind-body>{{ .Content }}</div>
  {{ with .Params.tags }}<div class="tags">{{ range . }}<a href="/tags/{{ . | urlize }}/">#{{ . }}</a>{{ end }}</div>{{ end }}
</article>
{{ end }}
```

- [ ] **Step 5: Build and verify projects render**

Run: `hugo --gc --baseURL "/"`
Expected: exit 0.

Run: `grep -q "ls projects/" public/projects/index.html && grep -q "xrpl-sweep" public/projects/index.html && grep -q "↗repo" public/projects/index.html && echo OK`
Expected: `OK`

Run: `test -f public/projects/xrpl-sweep/index.html && echo SINGLE_OK`
Expected: `SINGLE_OK`

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: projects content type with terminal listing and 3 seeded projects"
```

---

## Task 6: Video shortcode

**Files:**
- Create: `layouts/shortcodes/video.html`

**Interfaces:**
- Consumes: `.video` class (Task 2).
- Produces: shortcode usable as `{{</* video mp4="/img/x.mp4" */>}}`, `{{</* video youtube="ID" */>}}`, `{{</* video vimeo="ID" */>}}`.

- [ ] **Step 1: Write `layouts/shortcodes/video.html`**

```go-html-template
{{- if .Get "youtube" -}}
<div class="video"><iframe src="https://www.youtube-nocookie.com/embed/{{ .Get "youtube" }}" title="{{ .Get "title" | default "YouTube video" }}" loading="lazy" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>
{{- else if .Get "vimeo" -}}
<div class="video"><iframe src="https://player.vimeo.com/video/{{ .Get "vimeo" }}" title="{{ .Get "title" | default "Vimeo video" }}" loading="lazy" allow="fullscreen; picture-in-picture" allowfullscreen></iframe></div>
{{- else if .Get "mp4" -}}
<div class="video"><video controls preload="none" {{ with .Get "poster" }}poster="{{ . }}"{{ end }}><source src="{{ .Get "mp4" }}" type="video/mp4">Your browser does not support the video tag.</video></div>
{{- else -}}
{{- errorf "video shortcode (%s): provide one of youtube, vimeo, or mp4" .Position -}}
{{- end -}}
```

- [ ] **Step 2: Verify the shortcode compiles via a temporary test post**

```bash
cat > content/posts/_video-test.md <<'EOF'
---
title: "Video Test"
date: 2026-06-27T00:00:00
description: "temp"
tags: [meta]
draft: false
---
{{< video youtube="dQw4w9WgXcQ" >}}
{{< video vimeo="76979871" >}}
EOF
hugo --gc --baseURL "/"
```

Expected: exit 0 (no shortcode error).

Run: `grep -q "youtube-nocookie.com/embed/dQw4w9WgXcQ" public/posts/-video-test/index.html && grep -q "player.vimeo.com/video/76979871" public/posts/-video-test/index.html && echo OK`
Expected: `OK`

- [ ] **Step 3: Remove the temporary test post**

```bash
rm content/posts/_video-test.md
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: video shortcode (youtube/vimeo/mp4)"
```

---

## Task 7: Pagefind search

**Files:**
- Create: `content/search.md`
- Modify: `layouts/partials/search.html` (fill the stub)
- Create: `layouts/_default/search.html`

**Interfaces:**
- Consumes: Pagefind output produced by `scripts/cf-build.sh` (Task 10) and `data-pagefind-body` markers (Tasks 4, 5).
- Produces: `/search/` page that loads the Pagefind UI.

- [ ] **Step 1: Write `content/search.md`**

```markdown
---
title: "Search"
layout: "search"
description: "Search the site."
---
```

- [ ] **Step 2: Write `layouts/partials/search.html`** (replace the empty stub)

```go-html-template
<link href="/pagefind/pagefind-ui.css" rel="stylesheet">
<script src="/pagefind/pagefind-ui.js"></script>
<div id="search"></div>
<script>
window.addEventListener('DOMContentLoaded',function(){
  new PagefindUI({element:"#search",showSubResults:true,showImages:false});
});
</script>
```

- [ ] **Step 3: Write `layouts/_default/search.html`**

```go-html-template
{{ define "main" }}
<div class="wrap reading" style="padding:34px 0">
  <div class="sec-label">~/ergophobia $ grep -r "{{ "{{query}}" }}"</div>
  {{ partial "search.html" . }}
</div>
{{ end }}
```

- [ ] **Step 4: Build with Pagefind and verify the search page**

Run: `hugo --gc --baseURL "/" && npx -y pagefind@1 --site public`
Expected: both exit 0; Pagefind prints an indexed-pages count ≥ 5.

Run: `test -f public/search/index.html && test -d public/pagefind && grep -q "PagefindUI" public/search/index.html && echo OK`
Expected: `OK`

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: Pagefind search page and UI"
```

---

## Task 8: Feeds, 404, and robots

**Files:**
- Create: `layouts/404.html`, `layouts/robots.txt`

**Interfaces:**
- Consumes: `baseof.html` block `main`, footer/header partials.
- Produces: `public/404.html`, `public/robots.txt`, `public/index.xml` (RSS, from `hugo.toml` outputs configured in Task 1).

- [ ] **Step 1: Write `layouts/404.html`**

```go-html-template
{{ define "main" }}
<section class="wrap hero">
  <div class="promptline"><span class="g">jim@ergophobia</span>:~$ cat {{ .RelPermalink }}</div>
  <h1>404: <span class="hl">no such file or directory</span><span class="cursor"></span></h1>
  <p>That page doesn't exist. Try <a href="/posts/">/posts</a>, <a href="/projects/">/projects</a>, or head <a href="/">home</a>.</p>
</section>
{{ end }}
```

- [ ] **Step 2: Write `layouts/robots.txt`**

```go-html-template
User-agent: *
Allow: /
Sitemap: {{ .Site.BaseURL }}sitemap.xml
```

- [ ] **Step 3: Build and verify**

Run: `hugo --gc --baseURL "/"`
Expected: exit 0.

Run: `test -f public/404.html && test -f public/index.xml && grep -q "Sitemap:" public/robots.txt && echo OK`
Expected: `OK`

Run: `grep -q "no such file" public/404.html && echo PAGE_OK`
Expected: `PAGE_OK`

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: 404 page, robots.txt, RSS output"
```

---

## Task 9: Cloudflare Web Analytics (param-gated)

**Files:**
- Modify: `layouts/partials/analytics.html` (fill the stub)

**Interfaces:**
- Consumes: `.Site.Params.analytics.cloudflare_token` (defined in `hugo.toml`, Task 1). Already included by `head.html` (Task 2).
- Produces: the Cloudflare beacon `<script>` only when the token is non-empty.

- [ ] **Step 1: Write `layouts/partials/analytics.html`** (replace empty stub)

```go-html-template
{{- with .Site.Params.analytics.cloudflare_token -}}
<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "{{ . }}"}'></script>
{{- end -}}
```

- [ ] **Step 2: Verify it's absent when no token is set**

Run: `hugo --gc --baseURL "/"`
Expected: exit 0.

Run: `! grep -q "cloudflareinsights" public/index.html && echo ABSENT_OK`
Expected: `ABSENT_OK`

- [ ] **Step 3: Verify it appears when a token is set**

Run: `HUGO_PARAMS_ANALYTICS_CLOUDFLARE_TOKEN=testtoken123 hugo --gc --baseURL "/"`
Expected: exit 0.

Run: `grep -q 'testtoken123' public/index.html && echo PRESENT_OK`
Expected: `PRESENT_OK`

Then rebuild clean without the token:

Run: `hugo --gc --baseURL "/"`
Expected: exit 0; analytics absent again.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: param-gated Cloudflare Web Analytics beacon"
```

---

## Task 10: Build pipeline, Cloudflare config, content checker, and CI

**Files:**
- Create: `scripts/cf-build.sh`, `scripts/check-content.mjs`, `scripts/check-content.test.mjs`, `wrangler.jsonc`, `.github/workflows/ci.yml`

**Interfaces:**
- Consumes: `npm run build` (package.json, Task 1), all content from Tasks 4–5.
- Produces: `public/` deployable directory; `check-content.mjs` exports `validate(dir)` returning `{errors: string[]}`.

- [ ] **Step 1: Write `scripts/cf-build.sh`**

```sh
#!/usr/bin/env sh
# Absolute baseURL only for the real production deploy (main on Workers Builds);
# preview branches and local builds use host-relative "/".
set -eu
if [ "${WORKERS_CI:-}" = "1" ] && [ "${WORKERS_CI_BRANCH:-}" = "main" ]; then
  hugo --gc --minify
else
  hugo --gc --minify --baseURL "/"
fi
pagefind --site public
```

- [ ] **Step 2: Write the failing test `scripts/check-content.test.mjs`**

```javascript
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { validate } from "./check-content.mjs";

function scaffold(files) {
  const root = mkdtempSync(join(tmpdir(), "cc-"));
  for (const [rel, body] of Object.entries(files)) {
    const p = join(root, rel);
    mkdirSync(join(p, ".."), { recursive: true });
    writeFileSync(p, body);
  }
  return root;
}

test("valid post and project produce no errors", () => {
  const root = scaffold({
    "posts/a.md": "---\ntitle: A\ndate: 2026-01-01\ndescription: hi\ntags: [meta]\n---\nbody",
    "projects/p.md": "---\ntitle: p\nsummary: s\nstatus: active\nrepo: https://example.com\nweight: 1\n---\nb",
  });
  const { errors } = validate(root);
  assert.deepEqual(errors, []);
  rmSync(root, { recursive: true, force: true });
});

test("post missing description is an error", () => {
  const root = scaffold({ "posts/a.md": "---\ntitle: A\ndate: 2026-01-01\ntags: [x]\n---\nb" });
  const { errors } = validate(root);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /description/);
  rmSync(root, { recursive: true, force: true });
});

test("project with invalid status is an error", () => {
  const root = scaffold({ "projects/p.md": "---\ntitle: p\nsummary: s\nstatus: bogus\nrepo: https://x.io\nweight: 1\n---\nb" });
  const { errors } = validate(root);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /status/);
  rmSync(root, { recursive: true, force: true });
});

test("project with non-URL repo is an error", () => {
  const root = scaffold({ "projects/p.md": "---\ntitle: p\nsummary: s\nstatus: active\nrepo: not-a-url\nweight: 1\n---\nb" });
  const { errors } = validate(root);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /repo/);
  rmSync(root, { recursive: true, force: true });
});
```

- [ ] **Step 3: Run the test to confirm it fails**

Run: `node --test scripts/check-content.test.mjs`
Expected: FAIL — `Cannot find module './check-content.mjs'`.

- [ ] **Step 4: Write `scripts/check-content.mjs`**

```javascript
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (extname(p) === ".md") out.push(p);
  }
  return out;
}

function frontMatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return null;
  const fm = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    if (i === -1) continue;
    const k = line.slice(0, i).trim();
    let v = line.slice(i + 1).trim();
    if (v.startsWith("[") && v.endsWith("]")) v = v.slice(1, -1).split(",").map(s => s.trim()).filter(Boolean);
    fm[k] = v;
  }
  return fm;
}

const STATUSES = new Set(["active", "wip", "archived"]);
const isURL = s => typeof s === "string" && /^https?:\/\/\S+$/.test(s);

export function validate(root) {
  const errors = [];
  for (const file of walk(root)) {
    if (/(^|\/)_index\.md$/.test(file) || /\/search\.md$/.test(file) || /\/about\.md$/.test(file)) continue;
    const fm = frontMatter(readFileSync(file, "utf8"));
    const rel = file.slice(root.length + 1);
    if (!fm) { errors.push(`${rel}: missing front matter`); continue; }
    if (rel.startsWith("projects/")) {
      if (!fm.title) errors.push(`${rel}: missing title`);
      if (!fm.summary) errors.push(`${rel}: missing summary`);
      if (!STATUSES.has(fm.status)) errors.push(`${rel}: invalid status "${fm.status}" (active|wip|archived)`);
      if (!isURL(fm.repo)) errors.push(`${rel}: repo must be a URL`);
    } else {
      if (!fm.title) errors.push(`${rel}: missing title`);
      if (!fm.date) errors.push(`${rel}: missing date`);
      if (!fm.description) errors.push(`${rel}: missing description`);
    }
  }
  return { errors };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const root = process.argv[2] || "content";
  const { errors } = validate(root);
  if (errors.length) { console.error("Content check failed:\n" + errors.map(e => "  - " + e).join("\n")); process.exit(1); }
  console.log("Content check passed.");
}
```

- [ ] **Step 5: Run the test to confirm it passes**

Run: `node --test scripts/check-content.test.mjs`
Expected: PASS — 4 tests pass.

- [ ] **Step 6: Run the checker against real content**

Run: `node scripts/check-content.mjs content`
Expected: `Content check passed.`

- [ ] **Step 7: Write `wrangler.jsonc`**

```jsonc
{
  "name": "ergophobia",
  "compatibility_date": "2026-06-27",
  "preview_urls": true,
  "assets": {
    "directory": "./public",
    "html_handling": "auto-trailing-slash",
    "not_found_handling": "404-page"
  }
}
```

- [ ] **Step 8: Write `.github/workflows/ci.yml`**

```yaml
name: CI
on:
  pull_request:
  push:
    branches: [main]
permissions:
  contents: read
jobs:
  build:
    runs-on: ubuntu-latest
    env:
      HUGO_VERSION: "0.163.3"
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v4
        with:
          node-version: "22"
      - name: Install Hugo Extended
        run: |
          curl -sSLo hugo.tar.gz "https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_extended_${HUGO_VERSION}_linux-amd64.tar.gz"
          tar -xzf hugo.tar.gz hugo
          sudo install hugo /usr/local/bin/hugo
          hugo version
      - name: Install deps
        run: npm ci
      - name: Unit tests
        run: node --test
      - name: Content check
        run: node scripts/check-content.mjs content
      - name: Build (Hugo + Pagefind)
        run: npm run build
```

- [ ] **Step 9: Generate the lockfile and run the full build**

```bash
npm install
npm run build
```

Expected: `npm run build` exits 0; `public/` and `public/pagefind/` exist.

Run: `test -f public/index.html && test -d public/pagefind && echo BUILD_OK`
Expected: `BUILD_OK`

- [ ] **Step 10: Make the build script executable and commit**

```bash
chmod +x scripts/cf-build.sh
git add -A
git commit -m "feat: cf-build pipeline, wrangler config, content checker, CI workflow"
```

---

## Task 11: About page, favicon/OG assets, README, and cutover docs

**Files:**
- Create: `content/about.md`, `static/img/favicon.svg`, `static/img/og-default.png` (generated)
- Modify: `README.md` (replace), `layouts/partials/head.html` (add OG image fallback)

**Interfaces:**
- Consumes: `head.html` (Task 2), `single.html` for the about page.
- Produces: `/about/`, a favicon, and documentation for local dev + Cloudflare cutover.

- [ ] **Step 1: Write `content/about.md`**

```markdown
---
title: "About"
description: "Who's behind Ergophobia."
---

I'm Jim — a high-tech redneck who'd rather build tools and write things down than
feed the algorithm. Ergophobia is my quiet corner of the internet: long-form
thoughts and the projects I'm shipping, published here and nowhere else.

No memes, no ragebait, no analytics-driven outrage. Just signal.

Find the code behind most of what I build on [GitHub](https://github.com/ergofobe).
```

- [ ] **Step 2: Write `static/img/favicon.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="7" fill="#0b0f14"/>
  <path d="M7 10l5 6-5 6" fill="none" stroke="#3ee08f" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
  <line x1="15" y1="22" x2="24" y2="22" stroke="#3ee08f" stroke-width="2.4" stroke-linecap="round"/>
</svg>
```

- [ ] **Step 3: Generate a default OG image from the favicon**

Run:
```bash
hugo --gc --baseURL "/" >/dev/null 2>&1 || true
npx -y sharp-cli@^4 -i static/img/favicon.svg -o static/img/og-default.png resize 1200 630 --fit contain --background "#0b0f14" 2>/dev/null \
  || node -e 'console.log("sharp-cli unavailable; create static/img/og-default.png (1200x630) manually")'
test -f static/img/og-default.png && echo OG_OK || echo "OG image must be added manually (1200x630, dark bg)"
```

Expected: either `OG_OK`, or a clear manual-step message. If manual, create a 1200×630 PNG with the dark background `#0b0f14` and the wordmark `~/ergophobia` in green, saved to `static/img/og-default.png`, before continuing.

- [ ] **Step 4: Add the OG image fallback to `layouts/partials/head.html`**

Insert immediately **after** the `{{ template "_internal/opengraph.html" . }}` line:

```go-html-template
{{ $og := "/img/og-default.png" }}
{{ with .Params.cover }}{{ $og = . }}{{ end }}
<meta property="og:image" content="{{ $og | absURL }}">
<meta name="twitter:image" content="{{ $og | absURL }}">
```

- [ ] **Step 5: Write `README.md`**

````markdown
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
````

- [ ] **Step 6: Final full build and verification**

Run: `npm run check && npm test && npm run build`
Expected: content check passes, tests pass, build exits 0.

Run: `test -f public/about/index.html && test -f static/img/favicon.svg && grep -q 'og:image' public/index.html && echo ALL_OK`
Expected: `ALL_OK`

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: about page, favicon/OG assets, README with cutover docs"
```

---

## Self-Review Notes

- **Spec coverage:** Hugo stack + Workers deploy (T1,T10), terminal theme tokens dark+light (T2), self-hosted fonts (T2), whoami hero (T3), posts model + migration (T4), projects content type + listing + seeds (T5), video shortcode (T6), Pagefind (T7), RSS/404/robots (T8), Cloudflare analytics (T9), content checks + CI (T10), about/README/cutover + cleanup of Eleventy/Docker/Pages (T1,T11). All spec sections map to a task.
- **Cutover** is already complete: Jim connected the Worker to the GitHub repo and switched `ergophobia.org` to it (serving the Eleventy build until this redesign merges). T11 README documents the live state and the "verify on PR preview URL, then merge" flow rather than instructing a fresh cutover.
- **OG PNG generation** (T11 S3) may require a manual fallback if `sharp-cli` is unavailable in the environment; the step states this explicitly rather than leaving it implicit.
