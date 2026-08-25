import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname, dirname, resolve } from "node:path";

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (extname(p) === ".md") out.push(p);
  }
  return out;
}

// Drops a trailing ` # comment`, leaving quoted strings and flow sequences
// intact. Understands both YAML quote styles and their escape forms.
function stripComment(v) {
  const q = v[0];
  if (q === '"' || q === "'") {
    for (let i = 1; i < v.length; i++) {
      if (q === '"' && v[i] === "\\") { i++; continue; }
      if (v[i] !== q) continue;
      if (q === "'" && v[i + 1] === "'") { i++; continue; }
      return v.slice(0, i + 1);
    }
    return v;
  }
  if (q === "[") {
    const end = v.indexOf("]");
    return end === -1 ? v : v.slice(0, end + 1);
  }
  const hash = v.search(/\s#/);
  return hash === -1 ? v : v.slice(0, hash).trim();
}

function unquote(v) {
  if (v.length < 2) return v;
  if (v.startsWith('"') && v.endsWith('"')) return v.slice(1, -1).replace(/\\(["\\])/g, "$1");
  if (v.startsWith("'") && v.endsWith("'")) return v.slice(1, -1).replace(/''/g, "'");
  return v;
}

export function frontMatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return null;
  const fm = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    if (i === -1) continue;
    const k = line.slice(0, i).trim();
    let v = stripComment(line.slice(i + 1).trim());
    if (v.startsWith("[") && v.endsWith("]")) v = v.slice(1, -1).split(",").map(s => unquote(s.trim())).filter(Boolean);
    else v = unquote(v);
    fm[k] = v;
  }
  return fm;
}

const STATUSES = new Set(["active", "wip", "archived"]);
const isURL = s => typeof s === "string" && /^https?:\/\/\S+$/.test(s);
const COVER_ROOTS = ["assets", "static"];
const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif", ".gif"]);

function coverErrors(rel, cover, siteRoot) {
  if (typeof cover !== "string") return [`${rel}: cover must be a path string`];
  if (!cover.startsWith("/")) return [`${rel}: cover must be a site-absolute path (e.g. /img/covers/slug.png)`];
  if (!IMAGE_EXT.has(extname(cover).toLowerCase())) return [`${rel}: cover must be an image (${[...IMAGE_EXT].join(", ")})`];
  if (COVER_ROOTS.some(d => existsSync(join(siteRoot, d, cover.slice(1))))) return [];
  return [`${rel}: cover file not found under ${COVER_ROOTS.map(d => d + cover).join(" or ")}`];
}

export function validate(root, siteRoot = dirname(resolve(root))) {
  const errors = [];
  for (const file of walk(root)) {
    if (/(^|\/)_index\.md$/.test(file) || /\/search\.md$/.test(file) || /\/about\.md$/.test(file) || /\/contact\.md$/.test(file)) continue;
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
    if (fm.cover) {
      if (rel.startsWith("posts/")) errors.push(...coverErrors(rel, fm.cover, siteRoot));
      else errors.push(`${rel}: cover is only supported on posts/`);
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
