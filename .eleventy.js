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

  // === Collections ===
  eleventyConfig.addCollection("posts", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("./posts/**/*.{md,markdown}")
      .sort((a, b) => b.date - a.date);
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
