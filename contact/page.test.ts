import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import * as openpgp from "openpgp";

const root = join(import.meta.dirname, "..");

test("contact form is multipart with a multiple-file control and publishes the pubkey", async () => {
  const layout = readFileSync(join(root, "layouts/_default/contact.html"), "utf8");
  assert.match(layout, /enctype="multipart\/form-data"/);
  assert.match(layout, /type="file"/);
  assert.match(layout, /\bmultiple\b/);
  assert.match(layout, /name="attachments"/);
  assert.match(layout, /static\/jim\.asc|\/jim\.asc/);
  assert.match(layout, /BEGIN PGP PUBLIC KEY BLOCK|readFile "static\/jim\.asc"/);

  const key = readFileSync(join(root, "static", "jim.asc"), "utf8");
  assert.match(key, /-----BEGIN PGP PUBLIC KEY BLOCK-----/);
  assert.match(key, /-----END PGP PUBLIC KEY BLOCK-----/);
  const parsed = await openpgp.readKey({ armoredKey: key });
  assert.ok(parsed.getEncryptionKey());
  assert.ok(parsed.getUserIDs().some((u) => /jim@ergophobia\.org/i.test(u)));
});

test("built contact HTML contains a copy-pasteable OpenPGP public key", { timeout: 30_000 }, async () => {
  const dest = mkdtempSync(join(tmpdir(), "hugo-contact-"));
  try {
    const hugo = spawnSync("hugo", ["--quiet", "-d", dest], { cwd: root, encoding: "utf8" });
    assert.equal(hugo.status, 0, hugo.stderr);
    const html = readFileSync(join(dest, "contact", "index.html"), "utf8");
    assert.match(html, /type=["']?file["']?/);
    assert.match(html, /\bmultiple\b/);
    const m = html.match(/-----BEGIN PGP PUBLIC KEY BLOCK-----[\s\S]+?-----END PGP PUBLIC KEY BLOCK-----/);
    assert.ok(m, "expected armored key in built HTML");
    assert.doesNotMatch(m[0], /&#43;|&amp;|&lt;/);
    const parsed = await openpgp.readKey({ armoredKey: m[0] });
    assert.ok(parsed.getEncryptionKey());
  } finally {
    rmSync(dest, { recursive: true, force: true });
  }
});
