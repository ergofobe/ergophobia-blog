import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import * as openpgp from "openpgp";
import { buildEncryptedMail, safeFilename } from "./mail.ts";

const BODY = "UNIQUE_BODY_PLAINTEXT_7c4e9a2f_contact";
const FILE1_NAME = "alpha.txt";
const FILE1 = "UNIQUE_FILE1_CONTENTS_b8d1e33a_alpha.txt";
const FILE2_NAME = "photo.bin";
const FILE2 = Uint8Array.from(Buffer.from("UNIQUE_FILE2_BYTES_dd91c0\x00\x01\x02\xff", "binary"));

function extractArmored(eml: string): string {
  const start = eml.indexOf("-----BEGIN PGP MESSAGE-----");
  const end = eml.indexOf("-----END PGP MESSAGE-----");
  assert.ok(start >= 0 && end > start, "expected OpenPGP ciphertext in mail");
  return eml.slice(start, end + "-----END PGP MESSAGE-----".length);
}

function parseMultipart(src: string): { headers: Record<string, string>; body: string }[] {
  const m = src.match(/boundary="([^"]+)"/i);
  assert.ok(m, "expected multipart boundary");
  const boundary = m[1];
  const out: { headers: Record<string, string>; body: string }[] = [];
  for (const raw of src.split(`--${boundary}`)) {
    const trimmed = raw.trim();
    if (!trimmed || trimmed === "--") continue;
    if (!trimmed.toLowerCase().startsWith("content-") && !trimmed.toLowerCase().startsWith("mime-")) continue;
    const nl = raw.replace(/^\r?\n/, "").split(/\r?\n\r?\n/);
    if (nl.length < 2) continue;
    const headers: Record<string, string> = {};
    for (const line of nl[0].split(/\r?\n/)) {
      const i = line.indexOf(":");
      if (i > 0) headers[line.slice(0, i).toLowerCase()] = line.slice(i + 1).trim();
    }
    out.push({ headers, body: nl.slice(1).join("\n\n").replace(/\r?\n--\s*$/, "").replace(/(?:\r?\n)+$/, "") });
  }
  return out;
}

function filenameOf(part: { headers: Record<string, string> }): string {
  const disp = part.headers["content-disposition"] || "";
  const m = disp.match(/filename="([^"]+)"/i);
  return m ? m[1] : "";
}

async function ephemeralKeys() {
  return openpgp.generateKey({
    type: "ecc",
    curve: "curve25519",
    userIDs: [{ name: "Test", email: "test@example.com" }],
    format: "armored",
  });
}

async function decryptInner(eml: string, privateKeyArmored: string): Promise<string> {
  const decrypted = await openpgp.decrypt({
    message: await openpgp.readMessage({ armoredMessage: extractArmored(eml) }),
    decryptionKeys: await openpgp.readPrivateKey({ armoredKey: privateKeyArmored }),
  });
  assert.equal(typeof decrypted.data, "string");
  return decrypted.data as string;
}

test("buildEncryptedMail encrypts body and two attachments; decrypt recovers them", async () => {
  const keys = await ephemeralKeys();
  const eml = await buildEncryptedMail(
    {
      name: "Alice Tester",
      email: "alice@example.com",
      subject: "hello encrypted",
      body: BODY,
      attachments: [
        { filename: FILE1_NAME, contentType: "text/plain", bytes: new TextEncoder().encode(FILE1) },
        { filename: `subdir/${FILE2_NAME}`, contentType: "application/octet-stream", bytes: FILE2 },
      ],
    },
    { to: "jim@ergophobia.org", from: "contact@ergophobia.org", publicKeyArmored: keys.publicKey },
  );

  assert.match(eml, /Content-Type: multipart\/encrypted; protocol="application\/pgp-encrypted"/);
  assert.match(eml, /-----BEGIN PGP MESSAGE-----/);
  assert.match(eml, /-----END PGP MESSAGE-----/);
  assert.doesNotMatch(eml, new RegExp(BODY));
  assert.doesNotMatch(eml, new RegExp(FILE1));
  assert.equal(eml.includes("UNIQUE_FILE2_BYTES_dd91c0"), false);

  const inner = await decryptInner(eml, keys.privateKey);
  assert.match(inner, new RegExp(BODY));
  const parts = parseMultipart(inner);
  const text = parts.find((p) => (p.headers["content-type"] || "").startsWith("text/plain"));
  assert.ok(text, "expected decrypted text part");
  assert.match(text.body, new RegExp(BODY));
  assert.match(text.body, /From: Alice Tester <alice@example.com>/);

  const files = parts.filter((p) => /attachment/i.test(p.headers["content-disposition"] || ""));
  assert.equal(files.length, 2);
  const f1 = files.find((p) => filenameOf(p) === FILE1_NAME);
  const f2 = files.find((p) => filenameOf(p) === FILE2_NAME);
  assert.ok(f1, "expected alpha.txt");
  assert.ok(f2, "expected photo.bin (path stripped)");
  assert.equal(Buffer.from(f1.body.replace(/\s/g, ""), "base64").toString("utf8"), FILE1);
  assert.deepEqual(Uint8Array.from(Buffer.from(f2.body.replace(/\s/g, ""), "base64")), FILE2);
});

test("gpg can decrypt OpenPGP.js ciphertext from buildEncryptedMail", async () => {
  const keys = await ephemeralKeys();
  const eml = await buildEncryptedMail(
    {
      name: "Bob",
      email: "bob@example.com",
      subject: "gpg path",
      body: BODY,
      attachments: [{ filename: FILE1_NAME, contentType: "text/plain", bytes: new TextEncoder().encode(FILE1) }],
    },
    { to: "jim@ergophobia.org", from: "contact@ergophobia.org", publicKeyArmored: keys.publicKey },
  );
  const home = mkdtempSync(join(tmpdir(), "gpg-mail-"));
  try {
    writeFileSync(join(home, "sec.asc"), keys.privateKey);
    const imp = spawnSync("gpg", ["--batch", "--import", join(home, "sec.asc")], {
      env: { ...process.env, GNUPGHOME: home },
      encoding: "utf8",
    });
    assert.equal(imp.status, 0, imp.stderr);
    const dec = spawnSync(
      "gpg",
      ["--batch", "--yes", "--trust-model", "always", "--pinentry-mode", "loopback", "--passphrase", "", "--decrypt"],
      { env: { ...process.env, GNUPGHOME: home }, input: extractArmored(eml), encoding: "utf8" },
    );
    assert.equal(dec.status, 0, dec.stderr);
    assert.match(dec.stdout, new RegExp(BODY));
    const files = parseMultipart(dec.stdout).filter((p) => /attachment/i.test(p.headers["content-disposition"] || ""));
    assert.equal(files.length, 1);
    assert.equal(filenameOf(files[0]), FILE1_NAME);
    assert.equal(Buffer.from(files[0].body.replace(/\s/g, ""), "base64").toString("utf8"), FILE1);
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});

test("safeFilename strips paths", () => {
  assert.equal(safeFilename("../../etc/passwd"), "passwd");
  assert.equal(safeFilename('a"b\nc.txt'), "abc.txt");
});

test("published jim.asc is a valid OpenPGP public key", async () => {
  const key = readFileSync(new URL("../static/jim.asc", import.meta.url), "utf8");
  assert.match(key, /-----BEGIN PGP PUBLIC KEY BLOCK-----/);
  assert.match(key, /-----END PGP PUBLIC KEY BLOCK-----/);
  const parsed = await openpgp.readKey({ armoredKey: key });
  assert.ok(parsed.getUserIDs().some((u) => /jim@ergophobia\.org/i.test(u)));
  assert.ok(parsed.getEncryptionKey());
});
