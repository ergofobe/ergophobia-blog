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
    else if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
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
