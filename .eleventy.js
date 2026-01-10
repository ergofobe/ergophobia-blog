// .eleventy.js
import { DateTime } from 'luxon';

export default function (eleventyConfig) {
  // === URL Helpers ===
  eleventyConfig.addFilter("absoluteUrl", function (url, base) {
    try {
      const baseUrl = base || "http://localhost:8080";
      return new URL(url, baseUrl).href;
    } catch {
      return url;
    }
  });

  // === Content Helpers ===
  const MAX_EXCERPT_LENGTH = 250;

  function cleanText(content) {
    if (!content) return "";
    const textOnly = content.replace(/<[^>]+>/g, "");
    return textOnly.replace(/\s+/g, " ").trim();
  }

  // Extract first N paragraphs from rendered HTML
  function extractFirstParagraphs(html, count = 2) {
    if (!html) return "";

    // Split by paragraph tags and extract content
    const paragraphs = html.split(/<\/p>/i).slice(0, count);

    // Reconstruct HTML with closing tags
    const result = paragraphs.map(p => p + (p.trim() && !p.endsWith('</p>') ? '</p>' : '')).join('');

    return result.trim();
  }

  // Check if content has more than N paragraphs
  function hasMoreThanParagraphs(html, count = 2) {
    if (!html) return false;
    const paragraphCount = (html.match(/<p[^>]*>/gi) || []).length;
    return paragraphCount > count;
  }

  // Provide access to raw (unrendered) content - very useful for accurate excerpts
  eleventyConfig.addFilter("rawContent", function () {
    return this.page.rawContent || this.ctx?.page?.rawContent || "";
  });

  // Extract first 2 paragraphs with markdown formatting intact
  eleventyConfig.addFilter("firstTwoParagraphs", function (post) {
    const content = post.templateContent || "";
    return extractFirstParagraphs(content, 2);
  });

  // Check if post needs expansion (has more than 2 paragraphs)
  eleventyConfig.addFilter("needsExpand", function (post) {
    const content = post.templateContent || "";
    // Count paragraphs in the rendered HTML
    const paragraphCount = (content.match(/<p[^>]*>/gi) || []).length;
    return paragraphCount > 2;
  });

  // Better excerpt using raw content when possible (legacy fallback)
  eleventyConfig.addFilter("smartExcerpt", function () {
    const raw = this.rawContent?.() || cleanText(this.templateContent || "");
    const text = cleanText(raw);

    if (text.length <= MAX_EXCERPT_LENGTH) {
      return text;
    }

    let excerpt = text.substring(0, MAX_EXCERPT_LENGTH);
    const lastSpace = excerpt.lastIndexOf(" ");
    if (lastSpace > -1) {
      excerpt = excerpt.substring(0, lastSpace);
    }
    return excerpt.trim() + "…";
  });

  // Keep your original excerpt and isTruncated as fallback/legacy if needed
  eleventyConfig.addFilter("excerpt", function (templateContent) {
    const cleaned = cleanText(templateContent);
    if (cleaned.length <= MAX_EXCERPT_LENGTH) return cleaned;
    let excerpt = cleaned.substring(0, MAX_EXCERPT_LENGTH);
    const lastSpace = excerpt.lastIndexOf(" ");
    if (lastSpace > 0) excerpt = excerpt.substring(0, lastSpace);
    return excerpt + "…";
  });

  eleventyConfig.addFilter("isTruncated", function (templateContent) {
    const cleaned = cleanText(templateContent);
    if (cleaned.length <= MAX_EXCERPT_LENGTH) return false;
    let excerpt = cleaned.substring(0, MAX_EXCERPT_LENGTH);
    const lastSpace = excerpt.lastIndexOf(" ");
    if (lastSpace > 0) excerpt = excerpt.substring(0, lastSpace);
    return excerpt.length < cleaned.length;
  });

  // === Date Formatting with Luxon ===
  eleventyConfig.addFilter("formatDate", function (dateInput, format = "MMMM d, yyyy") {
    let dt;
    if (dateInput === "now") {
      dt = DateTime.now();
    } else if (dateInput instanceof Date) {
      dt = DateTime.fromJSDate(dateInput);
    } else if (typeof dateInput === "string" || typeof dateInput === "number") {
      dt = DateTime.fromJSDate(new Date(dateInput));
    } else {
      dt = DateTime.now();
    }
    if (!dt.isValid) {
      return "Invalid date";
    }
    return dt.toFormat(format);
  });

  // Current year helper
  eleventyConfig.addFilter("year", () => DateTime.now().year);

  // === Video Platform Detection and Helpers ===
  // Detect video platform from URL
  eleventyConfig.addFilter("detectVideoPlatform", function (url) {
    if (!url) return null;
    
    // YouTube patterns
    if (/youtube\.com|youtu\.be/.test(url)) {
      return "youtube";
    }
    
    // Vimeo patterns
    if (/vimeo\.com/.test(url)) {
      return "vimeo";
    }
    
    // Direct video file (MP4, WebM, OGG)
    if (/\.(mp4|webm|ogg|mov)(\?|$)/i.test(url)) {
      return "direct";
    }
    
    return null;
  });

  // Extract YouTube video ID from various URL formats
  eleventyConfig.addFilter("extractYoutubeId", function (url) {
    if (!url) return null;
    
    // Handle various YouTube URL formats:
    // https://www.youtube.com/watch?v=VIDEO_ID
    // https://youtu.be/VIDEO_ID
    // https://www.youtube.com/embed/VIDEO_ID
    // https://youtube.com/watch?v=VIDEO_ID
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/  // Direct video ID
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return null;
  });

  // Extract Vimeo video ID from URL
  eleventyConfig.addFilter("extractVimeoId", function (url) {
    if (!url) return null;
    
    // Handle Vimeo URL formats:
    // https://vimeo.com/VIDEO_ID
    // https://vimeo.com/album/ALBUM_ID/video/VIDEO_ID
    // https://player.vimeo.com/video/VIDEO_ID
    const patterns = [
      /vimeo\.com\/(?:album\/\d+\/video\/|video\/)?(\d+)/,
      /player\.vimeo\.com\/video\/(\d+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return null;
  });

  // Generate poster image URL for MP4 videos (auto-detect common patterns)
  eleventyConfig.addFilter("getVideoPoster", function (videoUrl, posterUrl) {
    // If poster URL is explicitly provided, use it
    if (posterUrl) return posterUrl;
    
    if (!videoUrl) return null;
    
    // Try to auto-detect poster by replacing video extension with image extensions
    // Common patterns: video.mp4 -> video.jpg, video.png, video.webp
    // We'll try jpg first as it's the most common, but you can specify explicitly if needed
    const posterUrlAuto = videoUrl.replace(/\.(mp4|webm|ogg|mov)(\?|$)/i, '.jpg$2');
    
    // Note: The browser will handle 404s gracefully if the image doesn't exist
    // For best results, explicitly provide a posterUrl in front matter
    return posterUrlAuto;
  });

  // === Collections ===
  eleventyConfig.addCollection("posts", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("./posts/**/*.{md,markdown}")
      .sort((a, b) => b.date - a.date);
  });

  // === Transform: Add captions to images ===
  // This transform wraps images with alt text in figure/figcaption elements
  eleventyConfig.addTransform("image-captions", function (content, outputPath) {
    // Only process HTML files
    if (!outputPath || !outputPath.endsWith(".html")) {
      return content;
    }

    // First pass: handle images inside paragraphs (common markdown behavior)
    // This regex matches <p>...</p> that contains only an img tag with optional whitespace
    content = content.replace(/<p[^>]*>\s*(<img([^>]*?)alt="([^"]*?)"([^>]*?)>)\s*<\/p>/gi, (match, imgTag, before, altText, after) => {
      // Skip if alt text is empty or just whitespace
      if (!altText || !altText.trim()) {
        return match;
      }
      return `<figure class="image-with-caption">${imgTag}<figcaption class="image-caption">${altText}</figcaption></figure>`;
    });

    // Second pass: handle standalone img tags (not in paragraphs, not already in figures)
    // Use a function to check if we're inside a figure tag
    content = content.replace(/<img([^>]*?)alt="([^"]*?)"([^>]*?)>/gi, (match, before, altText, after, offset, fullString) => {
      // Skip if alt text is empty or just whitespace
      if (!altText || !altText.trim()) {
        return match;
      }

      // Check if we're already inside a figure tag by looking backwards
      // Find the last unclosed figure tag before this position
      const textBefore = fullString.substring(Math.max(0, offset - 500), offset);
      const figureMatches = [...textBefore.matchAll(/<figure[^>]*>|<\/figure[^>]*>/gi)];
      
      let openFigureCount = 0;
      for (const figureMatch of figureMatches) {
        if (figureMatch[0].startsWith('</')) {
          openFigureCount--;
        } else {
          openFigureCount++;
        }
      }

      // If we're inside an open figure tag, skip this image
      if (openFigureCount > 0) {
        return match;
      }

      // Wrap the image
      const imgTag = `<img${before}alt="${altText}"${after}>`;
      return `<figure class="image-with-caption">${imgTag}<figcaption class="image-caption">${altText}</figcaption></figure>`;
    });

    return content;
  });

  // Copy static assets (CSS, JS, images, etc.)
  eleventyConfig.addPassthroughCopy("styles");
  eleventyConfig.addPassthroughCopy("assets");

  return {
    dir: {
      input: ".",
      includes: "_includes",
      output: "_site",
      data: "_data",
    },
    pathPrefix: "/",
    templateFormats: ["md", "njk", "html", "liquid"],
  };
}
