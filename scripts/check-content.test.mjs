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

test("post cover pointing at an existing asset produces no errors", () => {
  const root = scaffold({
    "content/posts/a.md": '---\ntitle: A\ndate: 2026-01-01\ndescription: hi\ncover: "/img/covers/a.png"\n---\nb',
    "assets/img/covers/a.png": "x",
  });
  const { errors } = validate(join(root, "content"), root);
  assert.deepEqual(errors, []);
  rmSync(root, { recursive: true, force: true });
});

test("front matter with YAML inline comments parses as documented in AGENTS.md", () => {
  const root = scaffold({
    "content/posts/a.md":
      '---\ntitle: A\ndate: 2026-01-01\ndescription: hi\ncover: "/img/covers/a.png"   # optional — social share image\ncoverAlt: "Alt."  # optional\ntags: [meta, x]  # topics\n---\nb',
    "assets/img/covers/a.png": "x",
  });
  const { errors } = validate(join(root, "content"), root);
  assert.deepEqual(errors, []);
  rmSync(root, { recursive: true, force: true });
});

test("a # inside a quoted value is not treated as a comment", () => {
  const root = scaffold({
    "content/posts/a.md": '---\ntitle: A\ndate: 2026-01-01\ndescription: "Tagged #hashtag here"\n---\nb',
  });
  const { errors } = validate(join(root, "content"), root);
  assert.deepEqual(errors, []);
  rmSync(root, { recursive: true, force: true });
});

test("cover existence is checked even when no asset roots exist", () => {
  const root = scaffold({
    "content/posts/a.md": '---\ntitle: A\ndate: 2026-01-01\ndescription: hi\ncover: "/img/covers/a.png"\n---\nb',
  });
  const { errors } = validate(join(root, "content"), root);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /not found/);
  rmSync(root, { recursive: true, force: true });
});

test("post cover with no matching file is an error", () => {
  const root = scaffold({
    "content/posts/a.md": '---\ntitle: A\ndate: 2026-01-01\ndescription: hi\ncover: "/img/covers/missing.png"\n---\nb',
    "assets/img/covers/a.png": "x",
  });
  const { errors } = validate(join(root, "content"), root);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /not found/);
  rmSync(root, { recursive: true, force: true });
});

test("cover on an update is an error", () => {
  const root = scaffold({
    "updates/u.md": '---\ntitle: U\ndate: 2026-01-01\ndescription: hi\ncover: "/img/covers/a.png"\n---\nb',
  });
  const { errors } = validate(root);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /only supported on posts/);
  rmSync(root, { recursive: true, force: true });
});

test("valid project with YAML-quoted scalar values produces no errors", () => {
  const root = scaffold({
    "projects/p.md":
      '---\ntitle: p\nsummary: s\nstatus: "active"\nrepo: "https://example.com"\nweight: 1\n---\nb',
  });
  const { errors } = validate(root);
  assert.deepEqual(errors, []);
  rmSync(root, { recursive: true, force: true });
});
