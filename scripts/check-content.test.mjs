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
