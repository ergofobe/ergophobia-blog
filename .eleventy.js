// .eleventy.js
import fs from "node:fs";

export default function (eleventyConfig) {
  // Existing filters (unchanged)
  eleventyConfig.addFilter("absoluteUrl", function (url, base) {
    try {
      const baseUrl = base || "http://localhost:8080";
      return new URL(url, baseUrl).href;
    } catch (e) {
      console.error("absoluteUrl error:", e);
      return url;
    }
  });

  eleventyConfig.addFilter("excerpt", function (templateContent) {
    if (!templateContent) return "";
    const textOnly = templateContent.replace(/<[^>]+>/g, "");
    const cleaned = textOnly.replace(/\s+/g, " ").trim();
    const maxLength = 250;
    let excerpt = cleaned.substring(0, maxLength);
    const lastSpace = excerpt.lastIndexOf(" ");
    if (lastSpace > 0) {
      excerpt = excerpt.substring(0, lastSpace);
    }
    return excerpt + (cleaned.length > maxLength ? "..." : "");
  });

  eleventyConfig.addFilter("date", function (date) {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  });

  // Add computed pageEffectiveDate per file
  eleventyConfig.addGlobalData("eleventyComputed.pageEffectiveDate", function () {
    // Fallback to current time (worst case)
    let effectiveDate = new Date();

    // Try to get git last modified (Eleventy exposes this via page.date when no front matter date)
    if (this.page?.date) {
      effectiveDate = this.page.date;
    }

    // If page.date looks like current time (within ~2 minutes), fallback to file creation time
    const now = Date.now();
    if (Math.abs(now - effectiveDate.getTime()) < 120000) {
      try {
        const inputPath = this.page?.inputPath;
        if (inputPath) {
          const stats = fs.statSync(inputPath);
          effectiveDate = stats.birthtime; // file creation time
        }
      } catch (e) {
        console.warn(`Cannot stat file for creation time: ${e.message}`);
      }
    }

    return effectiveDate;
  });

  // Posts collection – use pageEffectiveDate for sorting
  eleventyConfig.addCollection("posts", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("./posts/**/*.{md,markdown}")
      .sort((a, b) => {
        const dateA = a.pageEffectiveDate || new Date();
        const dateB = b.pageEffectiveDate || new Date();
        return dateB - dateA; // newest first
      });
  });

  return {
    dir: {
      input: ".",
      includes: "_includes",
      output: "_site"
    },
    pathPrefix: "/",
    templateFormats: ["md", "njk", "html"]
  };
};
