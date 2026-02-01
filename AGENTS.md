# AGENTS.md - AI Agent Guide for Ergophobia Blog

This document provides comprehensive guidance for AI agents working on the Ergophobia blog. It covers site architecture, content creation standards, formatting requirements, and best practices.

## Table of Contents

1. [Site Overview](#site-overview)
2. [Making Changes to the Site](#making-changes-to-the-site)
3. [Content Creation Guidelines](#content-creation-guidelines)
4. [Front-Matter Formatting](#front-matter-formatting)
5. [Image Inclusion](#image-inclusion)
6. [Video Posts](#video-posts)
7. [File Naming and Organization](#file-naming-and-organization)
8. [Tone and Voice](#tone-and-voice)
9. [Technical Details](#technical-details)

---

## Site Overview

**Technology Stack:**
- **Static Site Generator:** Eleventy (11ty) v3.1.2
- **Template Engine:** Nunjucks (`.njk` files)
- **Content Format:** Markdown (`.md` files)
- **Styling:** Custom CSS in `styles/main.css`
- **Build Output:** `_site/` directory

**Key Directories:**
- `posts/` - All blog posts (markdown files)
- `_includes/` - Layout templates (`article.njk`, `video.njk`, `layout.njk`)
- `assets/` - Static assets (images, etc.)
- `styles/` - CSS stylesheets
- `_site/` - Generated site (do not edit directly)

**Build Commands:**
- `npm start` - Development server with live reload
- `npm run build` - Production build
- `npm watch` - Watch mode for rebuilding on changes

---

## Making Changes to the Site

### General Principles

1. **Never edit files in `_site/`** - This directory is auto-generated
2. **Edit source files only** - Markdown in `posts/`, templates in `_includes/`, styles in `styles/`
3. **Test locally** - Run `npm run build` to ensure the site builds properly and `npm start` to preview changes before committing
4. **Preserve existing structure** - Follow established patterns and conventions

### When to Modify Templates

Only modify templates (`_includes/*.njk`) when:
- Adding new post types or features
- Fixing bugs in layout/rendering
- Making site-wide UI/UX improvements

**Do NOT modify templates for:**
- Individual post styling (use CSS classes or inline styles if needed)
- Content-specific formatting (handle in markdown)
- One-off layout changes (create a custom layout if truly needed)

### When to Modify Styles

Modify `styles/main.css` when:
- Making site-wide design changes
- Adding new CSS classes for reusable components
- Fixing responsive design issues
- Improving accessibility

**Avoid:**
- Post-specific styles (use inline styles sparingly if absolutely necessary)
- Breaking existing styles without testing thoroughly

### When to Modify Configuration

The `.eleventy.js` file contains:
- Custom filters (date formatting, URL helpers, video detection)
- Content transforms (image captions, relative paths)
- Collection definitions

**Only modify if:**
- Adding new functionality that requires custom filters
- Fixing bugs in existing transforms
- Adding support for new content types

**Be cautious:** Changes here affect the entire site build process.

---

## Content Creation Guidelines

### Post Types

The site supports two main post types:

1. **Article Posts** (default) - Standard markdown articles
   - Layout: `article.njk`
   - Full markdown support
   - Images, videos (inline), code blocks, etc.

2. **Video Posts** - Dedicated video embeds
   - Layout: `video.njk`
   - Requires `videoUrl` in front-matter
   - Supports YouTube, Vimeo, and direct MP4 files

### Creating a New Post

1. **File Location:** Always create posts in the `posts/` directory
2. **File Naming:** Use format `YYYY-MM-DD-slug.md` (see [File Naming](#file-naming-and-organization))
3. **Front-Matter:** Always include required fields (see [Front-Matter Formatting](#front-matter-formatting))
4. **Content:** Write in markdown following tone guidelines (see [Tone and Voice](#tone-and-voice))

### Post Structure

**Standard Article Post:**
```markdown
---
layout: article.njk
title: Your Post Title
description: Optional meta description for SEO
date: 2026-01-09 14:00:00
author: Optional author name
tags:
  - tag1
  - tag2
---

Your content here in markdown format.
```

**Video Post:**
```markdown
---
layout: video.njk
title: Your Video Title
description: Optional meta description
date: 2026-01-09 14:00:00
videoUrl: https://example.com/video-url
posterUrl: https://example.com/poster.jpg  # Optional for MP4
---

Optional description text that appears below the video.
```

---

## Front-Matter Formatting

Front-matter is **critical** - incorrect formatting will break the build. Always use YAML format with triple dashes.

### Required Fields

| Field | Type | Required For | Format | Example |
|-------|------|--------------|--------|---------|
| `layout` | string | All posts | `article.njk` or `video.njk` | `layout: article.njk` |
| `date` | string | All posts | `YYYY-MM-DD HH:mm:ss` or ISO | `date: 2026-01-09 14:00:00` |
| `videoUrl` | string | Video posts | Full URL | `videoUrl: https://youtube.com/watch?v=...` |

### Optional Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `title` | string | Post title (displayed in feed and on post page) | `title: My Post Title` |
| `description` | string | Meta description for SEO/social sharing | `description: A brief summary` |
| `author` | string | Author name (displayed on post page) | `author: Jim Phillips` |
| `tags` | array | Post tags/categories | `tags: [tech, crypto, xrpl]` |
| `posterUrl` | string | Video thumbnail (for MP4 videos) | `posterUrl: https://example.com/thumb.jpg` |

### Author Field Guidelines

**For AI Agents Creating Content:**

The `author` field is **displayed to readers** on the post page, appearing next to the publication date. When creating content as an AI agent:

1. **Take credit for your work** - Always include an `author` field with your name/identifier when you create original content
2. **Use a consistent identifier** - Use the same author name across posts you create (e.g., `ConsolaAI`, `Claude`, `GPT-4`, etc.)
3. **Do not attribute to others** - Unless explicitly instructed to ghostwrite for someone else, do not attribute your original work to other authors
4. **Ghostwriting is explicit** - Only use another person's name as the author if you are explicitly instructed to write as that person (e.g., "write this post as Jim Phillips")

**Examples:**
- ✅ `author: ConsolaAI` (when you are ConsolaAI creating original content)
- ✅ `author: Claude` (when you are Claude creating original content)
- ✅ `author: Jim Phillips` (only when explicitly instructed to ghostwrite as Jim)
- ❌ Omitting the author field when you created the content
- ❌ Using someone else's name without explicit instruction

**Note:** The author field is optional, but it's recommended for transparency and proper attribution, especially for AI-generated content.

### Date Format Guidelines

**Preferred Format:**
```yaml
date: 2026-01-09 14:00:00
```

**Also Accepted:**
- ISO format: `date: '2026-01-09T14:00:00.000-05:00'`
- Date only: `date: 2026-01-09` (time defaults to 00:00:00)
- With timezone abbreviations: `date: 2026-01-09 14:00:00 EST`

**Important Notes:**
- The system automatically normalizes dates, but use the standard format when possible
- Dates determine post sorting (newest first)
- Dates affect permalinks (URL structure)
- Always use the actual publication date, not the current date unless appropriate

### Front-Matter Examples

**Minimal Article Post:**
```yaml
---
layout: article.njk
date: 2026-01-09 14:00:00
---
```

**Full Article Post:**
```yaml
---
layout: article.njk
title: Sweeping XRP with a Simple Node.js Tool
description: A secure CLI tool to sweep XRP from any BIP-39 mnemonic wallet
date: 2026-01-18 18:43:00
author: Jim Phillips
tags:
  - xrpl
  - xrp
  - cryptocurrency
  - node.js
---
```

**Video Post (YouTube):**
```yaml
---
layout: video.njk
title: Example Video Post
description: A sample post demonstrating video embedding
date: 2026-01-09 16:00:00
videoUrl: https://www.youtube.com/watch?v=VIDEO_ID
---
```

**Video Post (MP4 with Poster):**
```yaml
---
layout: video.njk
title: Example MP4 Video Post
description: A sample post demonstrating direct MP4 file embedding
date: 2026-01-09 16:00:00
videoUrl: https://example.com/video.mp4
posterUrl: https://example.com/poster.jpg
---
```

### Common Front-Matter Mistakes to Avoid

❌ **Missing triple dashes:**
```yaml
layout: article.njk
date: 2026-01-09
```

✅ **Correct:**
```yaml
---
layout: article.njk
date: 2026-01-09
---
```

❌ **Incorrect date format:**
```yaml
date: January 9, 2026
```

✅ **Correct:**
```yaml
date: 2026-01-09 14:00:00
```

❌ **Missing layout for video posts:**
```yaml
---
title: Video Post
videoUrl: https://youtube.com/...
---
```

✅ **Correct:**
```yaml
---
layout: video.njk
title: Video Post
videoUrl: https://youtube.com/...
---
```

---

## Image Inclusion

### Image Syntax

Use standard markdown image syntax:

```markdown
![Alt text description](/assets/image-name.webp)
```

Or with relative paths:

```markdown
![Description](relative/path/to/image.png)
```

### Image Best Practices

1. **Always include descriptive alt text** - This becomes the image caption automatically
2. **Use WebP format when possible** - Better compression, faster loading
3. **Store images in `assets/` directory** - This is copied to `_site/assets/` during build
4. **Use relative paths from site root** - Start with `/assets/` for absolute paths (they're converted to relative automatically)

### Automatic Image Captions

The site automatically wraps images with alt text in `<figure>` elements with captions. The alt text becomes the visible caption below the image.

**Example:**
```markdown
![A peaceful, minimalist writing workspace with natural light, a simple desk, tea, and a laptop—evoking calm focus](/assets/peaceful-workspace.webp)
```

**Renders as:**
- Image displayed
- Caption below: "A peaceful, minimalist writing workspace with natural light, a simple desk, tea, and a laptop—evoking calm focus"

### Image Guidelines

- **Alt text should be descriptive** - Not just "image" or "screenshot"
- **Keep file sizes reasonable** - Optimize images before adding
- **Use semantic file names** - `peaceful-workspace.webp` not `IMG_1234.webp`
- **Images are automatically constrained** - No need to specify width/height in most cases

### Adding New Images

1. Place image file in `assets/` directory
2. Reference in markdown: `![Description](/assets/filename.webp)`
3. The build process will:
   - Copy image to `_site/assets/`
   - Convert absolute paths to relative paths
   - Wrap with figure/caption if alt text is present

---

## Video Posts

### Supported Platforms

1. **YouTube**
   - Automatically detected from URLs
   - Supports: `youtube.com/watch?v=`, `youtu.be/`, `youtube.com/embed/`
   - Example: `videoUrl: https://www.youtube.com/watch?v=VIDEO_ID`

2. **Vimeo**
   - Automatically detected from URLs
   - Supports: `vimeo.com/VIDEO_ID`, `player.vimeo.com/video/VIDEO_ID`
   - Example: `videoUrl: https://vimeo.com/1151536013`

3. **Direct MP4 Files**
   - Supports: `.mp4`, `.webm`, `.ogg`, `.mov`
   - Requires publicly accessible URL
   - **Recommended:** Provide `posterUrl` for thumbnail
   - Example: `videoUrl: https://example.com/video.mp4`

### Video Post Front-Matter

**Required:**
- `layout: video.njk`
- `videoUrl: <url>`
- `date: <date>`

**Optional:**
- `title: <title>` - Displayed above video
- `description: <description>` - Meta description
- `posterUrl: <url>` - Thumbnail (especially for MP4 videos)

### Video Post Content

Content below the front-matter appears as description text below the video embed. Keep it concise since it's supplementary to the video.

**Example:**
```markdown
---
layout: video.njk
title: Example Video Post
date: 2026-01-09 16:00:00
videoUrl: https://www.youtube.com/watch?v=VIDEO_ID
---

This is optional description text that appears below the video embed.
You can add context, links, or additional information here.
```

### Embedding Videos in Article Posts

To embed a video within a regular article post (not using the video post type), use an iframe wrapper:

```markdown
<div class="article-video-embed">
<iframe src="https://www.youtube.com/embed/VIDEO_ID" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>
```

**Note:** The `article-video-embed` class ensures responsive sizing.

---

## File Naming and Organization

### Post File Naming Convention

**Format:** `YYYY-MM-DD-slug.md`

**Rules:**
- Date prefix: `YYYY-MM-DD` (publication date)
- Slug: lowercase, hyphens for spaces, URL-friendly
- Extension: `.md` (markdown)

**Examples:**
- ✅ `2026-01-09-intro.md`
- ✅ `2026-01-18-xrpl-sweep.md`
- ✅ `2026-02-01-daily-social-intel.md`
- ❌ `intro.md` (missing date)
- ❌ `2026-01-09 Intro.md` (spaces, capital letters)
- ❌ `01-09-2026-intro.md` (wrong date format)

### Slug Guidelines

- **Descriptive but concise** - `xrpl-sweep` not `post-about-xrpl-sweep-tool`
- **Lowercase only** - No capital letters
- **Hyphens for word separation** - Not underscores or spaces
- **No special characters** - Only letters, numbers, hyphens
- **Reflects content** - Should give a sense of what the post is about

### File Location

- **All posts go in `posts/` directory** - Never create posts elsewhere
- **No subdirectories** - All posts are flat in `posts/`
- **Don't rename published posts** - URLs are based on filenames; renaming breaks links

### Permalink Structure

Posts are automatically given permalinks based on filename:
- `2026-01-09-intro.md` → `/posts/2026-01-09-intro/`
- `2026-01-18-xrpl-sweep.md` → `/posts/2026-01-18-xrpl-sweep/`

**Important:** Changing a filename changes the URL, breaking existing links.

---

## Tone and Voice

### Core Principles

**Ergophobia** is described as "A quiet corner of the internet for thoughts without the noise of social media." The tone should reflect this:

1. **Calm and Thoughtful** - No clickbait, no outrage, no performative engagement
2. **Personal and Authentic** - First-person perspective is welcome
3. **Substance Over Style** - Focus on content, not flashy formatting
4. **Respectful of Reader's Time** - Be concise when possible, detailed when needed

### Writing Style

**Do:**
- Write naturally and conversationally
- Use first person when appropriate ("I built this", "I've noticed")
- Be direct and clear
- Include context and background when helpful
- Sign posts with `— Jim` or author name when personal

**Don't:**
- Use excessive emojis or formatting tricks
- Write clickbait headlines
- Over-explain obvious things
- Use jargon unnecessarily
- Write for algorithms (no keyword stuffing, no engagement bait)

### Verbosity Guidelines

**Be as long or short as needed** - There's no character limit or minimum.

**Examples from existing posts:**
- **Short:** The intro post is concise and welcoming (~30 lines)
- **Medium:** The XRPL sweep post is detailed and technical (~75 lines)
- **Long:** The daily social intel post is comprehensive and dense (~30 lines but very information-dense)

**Guidelines:**
- **Short posts:** Perfect for quick thoughts, updates, announcements
- **Medium posts:** Good for tutorials, explanations, personal reflections
- **Long posts:** Appropriate for comprehensive guides, deep dives, curated content

**Key:** Let the content determine the length, not arbitrary limits.

### Content Themes

Based on existing posts, common themes include:
- Technical tutorials and tools
- Cryptocurrency/blockchain (XRPL, XRP, etc.)
- Personal reflections on technology and social media
- Curated intelligence briefings
- Development and coding

**Note:** These are examples, not restrictions. The site is a personal blog with no strict topic boundaries.

### Formatting in Content

**Markdown is fully supported:**
- **Bold** for emphasis: `**text**`
- *Italic* for subtle emphasis: `*text*`
- Code blocks for technical content
- Links: `[text](url)`
- Lists (ordered and unordered)
- Headings (H2, H3, etc.) for structure

**Keep formatting minimal** - Let content shine, not formatting tricks.

---

## Technical Details

### Post Processing

The site automatically:

1. **Wraps images with captions** - Images with alt text get `<figure>` wrappers
2. **Converts absolute paths to relative** - For GitHub Pages compatibility
3. **Normalizes dates** - Various date formats are accepted and normalized
4. **Displays author attribution** - Author field from front-matter is displayed on post pages next to the date
5. **Sorts posts by date** - Newest first in feed
6. **Generates excerpts** - For meta descriptions and previews
7. **Detects video platforms** - Automatically embeds YouTube/Vimeo/MP4 correctly

### Long Post Handling

Posts with more than 2 paragraphs automatically get:
- "Show more" button in the feed
- First 2 paragraphs shown as preview
- Full content expandable inline
- No page navigation required

**This is automatic** - No configuration needed.

### Collections

All posts in `posts/` are automatically added to the `posts` collection, sorted by date (newest first).

### URL Structure

- **Homepage:** `/` or `/index.html`
- **Posts:** `/posts/YYYY-MM-DD-slug/`
- **Pagination:** `/page/2/`, `/page/3/`, etc. (6 posts per page)

### Build Process

1. Eleventy reads markdown files from `posts/`
2. Processes front-matter and content
3. Applies templates from `_includes/`
4. Runs transforms (image captions, relative paths)
5. Outputs HTML to `_site/`
6. Copies static assets (`styles/`, `assets/`) to `_site/`

### Testing Changes

**Before committing:**
1. Run `npm run build` to ensure the site builds correctly without errors
2. Run `npm start` to start dev server
3. Navigate to `http://localhost:8080`
4. Check your new/changed post
5. Verify images load correctly
6. Test responsive design (mobile/desktop)
7. Check that dates display correctly
8. Verify video embeds work (if applicable)

---

## Quick Reference Checklist

When creating a new post, ensure:

- [ ] File is in `posts/` directory
- [ ] Filename follows `YYYY-MM-DD-slug.md` format
- [ ] Front-matter has triple dashes (`---`)
- [ ] `layout` field is set (`article.njk` or `video.njk`)
- [ ] `date` field is in correct format (`YYYY-MM-DD HH:mm:ss`)
- [ ] `author` field is included (especially for AI-generated content)
- [ ] For video posts: `videoUrl` is included
- [ ] Images use descriptive alt text
- [ ] Images are in `assets/` directory
- [ ] Content follows tone guidelines
- [ ] Post has been tested locally: `npm run build` to verify build, then `npm start` to preview

---

## Common Tasks

### Creating a New Article Post

1. Create file: `posts/2026-01-09-my-post.md`
2. Add front-matter:
   ```yaml
   ---
   layout: article.njk
   title: My Post Title
   description: Brief description
   date: 2026-01-09 14:00:00
   author: Your Name Here
   ---
   ```
3. Write content in markdown
4. Add images to `assets/` and reference with `![alt](/assets/image.webp)`
5. Test: Run `npm run build` to verify build, then `npm start` to preview

### Creating a Video Post

1. Create file: `posts/2026-01-09-my-video.md`
2. Add front-matter:
   ```yaml
   ---
   layout: video.njk
   title: My Video Title
   date: 2026-01-09 14:00:00
   videoUrl: https://youtube.com/watch?v=VIDEO_ID
   author: Your Name Here
   ---
   ```
3. Add optional description below front-matter
4. Test: Run `npm run build` to verify build, then `npm start` to preview

### Adding an Image to a Post

1. Place image file in `assets/` directory (e.g., `assets/my-image.webp`)
2. Reference in markdown: `![Descriptive alt text](/assets/my-image.webp)`
3. The alt text will automatically become the caption

### Modifying Site Styles

1. Edit `styles/main.css`
2. Changes apply site-wide
3. Test: Run `npm run build` to verify build, then `npm start` to see changes
4. Be careful not to break existing styles

---

## Troubleshooting

### Post Not Appearing

- Check file is in `posts/` directory
- Verify front-matter syntax (triple dashes, correct YAML)
- Check date format is correct
- Run `npm run build` to regenerate
- Check browser console for errors

### Images Not Loading

- Verify image is in `assets/` directory
- Check path in markdown (should start with `/assets/`)
- Ensure image file exists and is accessible
- Check file extension matches (case-sensitive on some systems)

### Video Not Embedding

- Verify `layout: video.njk` is set
- Check `videoUrl` is correct and publicly accessible
- For YouTube/Vimeo, use full URL (not shortened)
- For MP4, ensure CORS is configured if hosted elsewhere

### Date Display Issues

- Use standard format: `YYYY-MM-DD HH:mm:ss`
- Avoid ambiguous formats
- System normalizes dates, but standard format is preferred

---

## Final Notes

- **This is a personal blog** - Maintain the calm, thoughtful tone
- **No engagement metrics** - Write for humans, not algorithms
- **Quality over quantity** - Better to have fewer, better posts
- **Test everything** - Always run `npm run build` to ensure the site builds correctly, then `npm start` to preview before committing
- **Follow existing patterns** - Consistency helps maintain the site's character

When in doubt, look at existing posts as examples. The intro post (`2026-01-09-intro.md`) is a good example of tone and structure. The XRPL sweep post (`2026-01-18-xrpl-sweep.md`) shows how to handle technical content. The daily social intel post (`2026-02-01-daily-social-intel.md`) demonstrates information-dense formatting.

---

**Last Updated:** 2026-02-01
**Site:** Ergophobia Blog
**Tech Stack:** Eleventy (11ty) v3.1.2
