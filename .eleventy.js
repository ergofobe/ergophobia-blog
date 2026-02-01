// .eleventy.js
import { DateTime } from 'luxon';
import matter from 'gray-matter';
import fs from 'fs';
import { glob } from 'glob';

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

  // Convert absolute URLs (starting with /) to relative paths for GitHub Pages
  eleventyConfig.addFilter("relativeUrl", function (url, currentPageUrl) {
    if (!url) return url;
    
    // If it's not an absolute path, return as-is
    if (!url.startsWith('/')) {
      return url;
    }
    
    // Normalize current page URL - remove trailing slash and handle index.html
    const currentPath = (currentPageUrl || '/').replace(/\/$/, '').replace(/\/index\.html$/, '');
    
    // Calculate depth of current page (number of path segments)
    const depth = currentPath.split('/').filter(p => p && p !== '').length;
    
    // Handle root path
    if (url === '/' || url === '/index.html') {
      return depth === 0 ? 'index.html' : '../'.repeat(depth) + 'index.html';
    }
    
    // Remove leading slash for relative path
    let relativePath = url.slice(1);
    
    if (depth === 0) {
      // We're at root, return path as-is
      return relativePath;
    } else {
      // We're in a subdirectory, prepend ../ for each level
      return '../'.repeat(depth) + relativePath;
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

  // === Date Parsing and Normalization ===
  // Normalize date strings from various formats to a standard Date object
  function normalizeDate(dateInput) {
    if (!dateInput) return null;
    
    // If it's already a Date object, return it
    if (dateInput instanceof Date) {
      return dateInput;
    }
    
    // If it's a number (timestamp), convert it
    if (typeof dateInput === "number") {
      return new Date(dateInput);
    }
    
    // If it's a string, try to parse it with Luxon's flexible parsing
    if (typeof dateInput === "string") {
      const dateStr = dateInput.trim();
      
      // Map common timezone abbreviations to IANA timezone names
      const timezoneMap = {
        'EST': 'America/New_York',
        'EDT': 'America/New_York',
        'CST': 'America/Chicago',
        'CDT': 'America/Chicago',
        'MST': 'America/Denver',
        'MDT': 'America/Denver',
        'PST': 'America/Los_Angeles',
        'PDT': 'America/Los_Angeles',
        'UTC': 'UTC',
        'GMT': 'GMT'
      };
      
      // Try to extract timezone abbreviation and replace with IANA name
      let normalizedStr = dateStr;
      let timezone = null;
      for (const [abbr, iana] of Object.entries(timezoneMap)) {
        if (dateStr.endsWith(' ' + abbr)) {
          normalizedStr = dateStr.replace(' ' + abbr, '').trim();
          timezone = iana;
          break;
        }
      }
      
      // Try various date formats that AI might generate
      const formats = [
        // Standard formats
        "yyyy-MM-dd HH:mm:ss",
        "yyyy-MM-dd HH:mm",
        "yyyy-MM-dd",
        // With timezone offsets (ISO format)
        "yyyy-MM-dd HH:mm Z",
        "yyyy-MM-dd HH:mm:ss Z",
        "yyyy-MM-dd HH:mm ZZZ",
        "yyyy-MM-dd HH:mm:ss ZZZ",
        // ISO formats
        "yyyy-MM-dd'T'HH:mm:ss",
        "yyyy-MM-dd'T'HH:mm:ss.SSS",
        "yyyy-MM-dd'T'HH:mm:ss.SSSZ",
        "yyyy-MM-dd'T'HH:mm:ssZ",
        // More flexible formats
        "MMM dd, yyyy HH:mm",
        "MMM dd, yyyy HH:mm:ss",
        "MMMM dd, yyyy HH:mm",
        "MMMM dd, yyyy HH:mm:ss",
      ];
      
      // Try parsing with each format (with timezone if we found one)
      for (const format of formats) {
        let dt;
        if (timezone) {
          dt = DateTime.fromFormat(normalizedStr, format, { zone: timezone });
        } else {
          dt = DateTime.fromFormat(normalizedStr, format);
        }
        if (dt.isValid) {
          return dt.toJSDate();
        }
      }
      
      // Try parsing the original string with timezone if we found one
      if (timezone) {
        const dtWithTz = DateTime.fromFormat(normalizedStr, "yyyy-MM-dd HH:mm", { zone: timezone });
        if (dtWithTz.isValid) {
          return dtWithTz.toJSDate();
        }
      }
      
      // Try Luxon's fromString which is very flexible
      const dtFlexible = DateTime.fromString(dateStr);
      if (dtFlexible.isValid) {
        return dtFlexible.toJSDate();
      }
      
      // Fallback to JavaScript's Date constructor
      const jsDate = new Date(dateStr);
      if (!isNaN(jsDate.getTime())) {
        return jsDate;
      }
    }
    
    return null;
  }

  // Preprocess markdown files to normalize dates in front matter
  // This runs before Eleventy processes the files
  eleventyConfig.on("eleventy.before", async function() {
    // Find all markdown files in the posts directory
    const postFiles = await glob('./posts/**/*.md');
    
    for (const filePath of postFiles) {
      try {
        // Read the file
        const fileContent = fs.readFileSync(filePath, 'utf8');
        
        // Parse front matter
        const parsed = matter(fileContent);
        
        // If there's a date field, normalize it
        if (parsed.data && parsed.data.date && typeof parsed.data.date === 'string') {
          const normalized = normalizeDate(parsed.data.date);
          if (normalized) {
            // Reconstruct the file with normalized date
            // Format the date as ISO string for Eleventy compatibility
            const dt = DateTime.fromJSDate(normalized);
            // Use ISO format which Eleventy handles well
            const formattedDate = dt.toISO();
            
            // Update the front matter - Eleventy will parse ISO strings correctly
            parsed.data.date = formattedDate;
            
            // Reconstruct the file content
            const newContent = matter.stringify(parsed.content, parsed.data);
            
            // Write back to file
            fs.writeFileSync(filePath, newContent, 'utf8');
          }
        }
      } catch (error) {
        console.warn(`Warning: Could not normalize date in ${filePath}:`, error.message);
      }
    }
  });

  // === Date Formatting with Luxon ===
  eleventyConfig.addFilter("formatDate", function (dateInput, format = "MMMM d, yyyy") {
    let dt;
    if (dateInput === "now") {
      dt = DateTime.now();
    } else if (dateInput instanceof Date) {
      dt = DateTime.fromJSDate(dateInput);
    } else if (typeof dateInput === "string" || typeof dateInput === "number") {
      // Try to normalize the date first
      const normalized = normalizeDate(dateInput);
      if (normalized) {
        dt = DateTime.fromJSDate(normalized);
      } else {
        dt = DateTime.fromJSDate(new Date(dateInput));
      }
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
    const posts = collectionApi
      .getFilteredByGlob("./posts/**/*.{md,markdown}")
      .map(post => {
        // Normalize the date if it exists
        if (post.data && post.data.date) {
          const normalized = normalizeDate(post.data.date);
          if (normalized) {
            post.data.date = normalized;
            post.date = normalized; // Also update the page date
          }
        }
        return post;
      });
    
    return posts.sort((a, b) => {
      const dateA = a.date || a.data?.date || new Date(0);
      const dateB = b.date || b.data?.date || new Date(0);
      return dateB - dateA;
    });
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

  // === Transform: Convert absolute asset paths to relative paths ===
  // This handles images and links from markdown content that use absolute paths
  eleventyConfig.addTransform("relative-asset-paths", function (content, outputPath) {
    // Only process HTML files
    if (!outputPath || !outputPath.endsWith(".html")) {
      return content;
    }

    // Calculate depth of current page based on output path
    // Handle both absolute paths (full system path) and relative paths
    // e.g., "/full/path/to/_site/posts/2026-01-09-intro/index.html" -> depth 2
    // e.g., "_site/posts/2026-01-09-intro/index.html" -> depth 2
    // e.g., "_site/index.html" -> depth 0
    let pathRelativeToOutput = outputPath;
    
    // If it's an absolute path, find the _site directory
    const siteDirMatch = pathRelativeToOutput.match(/[\/\\]_site[\/\\](.+)$/i);
    if (siteDirMatch) {
      pathRelativeToOutput = siteDirMatch[1];
    } else {
      // Relative path, remove _site/ if present
      pathRelativeToOutput = pathRelativeToOutput.replace(/^_site[\/\\]/, '');
    }
    
    // Split by both forward and back slashes for cross-platform compatibility
    const pathSegments = pathRelativeToOutput.split(/[\/\\]/).filter(p => p && p !== 'index.html');
    const depth = pathSegments.length;

    // Helper function to convert absolute path to relative
    function makeRelative(absPath) {
      if (!absPath || !absPath.startsWith('/')) {
        return absPath; // Already relative or not a path
      }

      // Remove leading slash
      const relativePath = absPath.slice(1);

      if (depth === 0) {
        // We're at root, return path as-is
        return relativePath;
      } else {
        // We're in a subdirectory, prepend ../ for each level
        return '../'.repeat(depth) + relativePath;
      }
    }

    // Convert absolute paths in src attributes (images, videos, etc.)
    content = content.replace(/src=["'](\/[^"']+)["']/gi, (match, src) => {
      const relativeSrc = makeRelative(src);
      return `src="${relativeSrc}"`;
    });

    // Convert absolute paths in href attributes for asset links
    // Only process asset paths, not page navigation links (those are handled by relativeUrl filter)
    content = content.replace(/href=["'](\/(?:assets|images|styles)\/[^"']+)["']/gi, (match, href) => {
      const relativeHref = makeRelative(href);
      return `href="${relativeHref}"`;
    });

    // Convert absolute paths in poster attributes (video posters)
    content = content.replace(/poster=["'](\/[^"']+)["']/gi, (match, poster) => {
      const relativePoster = makeRelative(poster);
      return `poster="${relativePoster}"`;
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
