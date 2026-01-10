# Ergophobia Blog

A minimal, neutral blog built with Eleventy (11ty) featuring support for multiple post types, video embeds, and media integration.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

```bash
npm install
```

### Development

```bash
# Start development server with live reload
npm start

# Build for production
npm run build

# Watch for changes and rebuild
npm watch
```

The site will be built to the `_site/` directory.

## Creating Posts

### File Naming Convention

Posts should be named using the following format:

```
YYYY-MM-DD-slug.md
```

Where:
- `YYYY-MM-DD` is the publication date
- `slug` is a URL-friendly identifier (lowercase, hyphens for spaces)

Example: `2026-01-09-my-first-post.md`

### Post Location

All posts go in the `posts/` directory at the root of the project.

## Post Types

This blog supports two main post types:

### 1. Article Posts (Default)

Standard markdown articles with full content support. This is the default post type.

**Front Matter:**
```yaml
---
layout: article.njk
title: Your Post Title
description: Optional meta description for SEO
date: 2026-01-09 14:00:00
---
```

**Example:**
```markdown
---
layout: article.njk
title: My First Article
description: A sample article post
date: 2026-01-09 13:25:00
---

Your markdown content here.

You can use **bold**, *italic*, and other markdown features.
```

### 2. Video Posts

Dedicated video posts that automatically detect the video platform and embed accordingly.

**Front Matter:**
```yaml
---
layout: video.njk
title: Your Video Title
description: Optional meta description
date: 2026-01-09 14:00:00
videoUrl: https://example.com/video-url
posterUrl: https://example.com/poster-image.jpg  # Optional for MP4 videos
---
```

**Supported Video Platforms:**

- **YouTube**: Automatically detects and embeds YouTube videos
  ```yaml
  videoUrl: https://www.youtube.com/watch?v=VIDEO_ID
  # or
  videoUrl: https://youtu.be/VIDEO_ID
  ```

- **Vimeo**: Automatically detects and embeds Vimeo videos
  ```yaml
  videoUrl: https://vimeo.com/VIDEO_ID
  ```

- **Direct MP4 Files**: Embeds MP4, WebM, OGG, or MOV files
  ```yaml
  videoUrl: https://example.com/video.mp4
  posterUrl: https://example.com/thumbnail.jpg  # Recommended
  ```

**Note:** For MP4 videos, you can specify a `posterUrl` for the thumbnail/poster image that shows before the video plays. If not provided, the system will attempt to auto-detect by replacing `.mp4` with `.jpg` in the video URL.

**Example:**
```markdown
---
layout: video.njk
title: My Video Post
date: 2026-01-09 14:00:00
videoUrl: https://www.youtube.com/watch?v=dQw4w9WgXcQ
---

Optional description text that appears below the video.
```

## Embedding Media in Articles

### Images

You can embed images in article posts using standard markdown syntax:

```markdown
![Alt text](https://example.com/image.jpg)
![Description](relative/path/to/image.png)
```

Images are automatically constrained to the article width and styled appropriately.

### Videos in Articles

To embed a video within an article post (not using the video post type), wrap an iframe in a div with the `article-video-embed` class:

```markdown
<div class="article-video-embed">
<iframe src="https://www.youtube.com/embed/VIDEO_ID" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>
```

**Note:** The `article-video-embed` class ensures the video is responsive and matches the article content width.

**YouTube Embed Example:**
```markdown
<div class="article-video-embed">
<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>
```

**Vimeo Embed Example:**
```markdown
<div class="article-video-embed">
<iframe src="https://player.vimeo.com/video/VIDEO_ID" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>
</div>
```

## Front Matter Fields

### Common Fields

All post types support these front matter fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `layout` | string | Yes | Post layout (`article.njk` or `video.njk`) |
| `title` | string | No | Post title (displayed on post page and in feed) |
| `description` | string | No | Meta description for SEO and social sharing |
| `date` | string | Yes | Publication date/time in format: `YYYY-MM-DD HH:mm:ss` |

### Video Post Specific Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `videoUrl` | string | Yes | URL to the video (YouTube, Vimeo, or direct MP4) |
| `posterUrl` | string | No | Poster/thumbnail image URL (recommended for MP4 videos) |

### Date Format

Dates should be formatted as:

```
YYYY-MM-DD HH:mm:ss
```

Example: `2026-01-09 14:00:00`

## Post Features

### Expand/Collapse for Long Posts

Articles with more than 2 paragraphs automatically get an "Show more" button in the feed. The first two paragraphs are shown as a preview, and users can expand to see the full content inline.

### Post Sorting

Posts are automatically sorted by date (newest first) in both the feed and collections.

## Project Structure

```
ergophobia-blog/
├── _includes/          # Layout templates
│   ├── article.njk    # Article post layout
│   ├── video.njk      # Video post layout
│   └── layout.njk     # Base layout
├── _site/             # Generated site (gitignored)
├── posts/             # All blog posts
│   ├── posts.json     # Default post configuration
│   └── *.md           # Post files
├── styles/            # CSS stylesheets
│   └── main.css       # Main stylesheet
├── index.njk          # Homepage/feed
├── 404.njk            # 404 error page
├── .eleventy.js       # Eleventy configuration
└── package.json       # Project dependencies
```

## Default Configuration

The `posts/posts.json` file sets default values for all posts:

```json
{
  "layout": "article.njk"
}
```

You can override these defaults in individual post front matter.

## Tips & Best Practices

1. **Post Dates**: Always use the correct date format. The date affects sorting and permalinks.

2. **Video Posts**: 
   - For YouTube/Vimeo, just provide the URL - platform detection is automatic
   - For MP4 files, always provide a `posterUrl` for better UX
   - Keep video descriptions concise since they appear below the embed

3. **Article Posts**:
   - Use the `article-video-embed` wrapper when embedding videos inline
   - Images will automatically be constrained to article width
   - Long posts (3+ paragraphs) will show expand/collapse in the feed

4. **File Naming**:
   - Use descriptive slugs that reflect the content
   - Keep slugs short and URL-friendly
   - Don't change post filenames after publishing (affects URLs)

5. **Descriptions**:
   - Write clear, concise meta descriptions for SEO
   - Keep them under 160 characters for best results

## Troubleshooting

### Video not embedding?
- Check that the `videoUrl` is correct and publicly accessible
- For YouTube/Vimeo, ensure you're using the full URL (not shortened)
- For MP4 files, ensure CORS is properly configured if hosted elsewhere

### Images too wide?
- Make sure images use relative URLs or full HTTPS URLs
- Images are automatically constrained, but ensure they're not set with inline width styles

### Post not appearing?
- Check the date is in the correct format
- Ensure the file is in the `posts/` directory
- Verify front matter syntax is correct (YAML format)
- Run `npm run build` to regenerate the site

## License

ISC
