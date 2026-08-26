import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:net";
import { mkdirSync, writeFileSync, chmodSync, readFileSync, existsSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";

const BODY = "UNIQUE_HTTP_BODY_PLAINTEXT_c91e4b77";
const FILE1 = "UNIQUE_HTTP_FILE1_aa11bb22";
const FILE2 = "UNIQUE_HTTP_FILE2_cc33dd44";

const scratch = process.env.SCRATCH || mkdtempSync(join(tmpdir(), "contact-sendmail-"));

function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const s = createServer();
    s.listen(0, "127.0.0.1", () => {
      const addr = s.address();
      if (!addr || typeof addr === "string") {
        s.close();
        reject(new Error("no port"));
        return;
      }
      const port = addr.port;
      s.close((err) => (err ? reject(err) : resolve(port)));
    });
    s.on("error", reject);
  });
}

function waitForListen(proc: ChildProcessWithoutNullStreams, timeoutMs = 8000): Promise<void> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("server did not start")), timeoutMs);
    let buf = "";
    const onData = (chunk: Buffer) => {
      buf += chunk.toString();
      if (buf.includes("contact listening")) {
        clearTimeout(t);
        proc.stdout.off("data", onData);
        resolve();
      }
    };
    proc.stdout.on("data", onData);
    proc.once("exit", (code) => {
      clearTimeout(t);
      reject(new Error(`server exited ${code} before listen: ${buf}`));
    });
  });
}

async function postOnce(port: number): Promise<Response> {
  const fd = new FormData();
  fd.set("name", "HTTP Tester");
  fd.set("email", "http@example.com");
  fd.set("subject", "shim post");
  fd.set("body", BODY);
  fd.append("attachments", new Blob([FILE1], { type: "text/plain" }), "one.txt");
  fd.append("attachments", new Blob([FILE2], { type: "text/plain" }), "two.txt");
  return fetch(`http://127.0.0.1:${port}/contact`, { method: "POST", body: fd, redirect: "manual" });
}

test("real contact POST writes OpenPGP mail via sendmail twice", { timeout: 30_000 }, async () => {
  mkdirSync(scratch, { recursive: true });
  const bin = join(scratch, "bin");
  mkdirSync(bin, { recursive: true });
  const sendmail = join(bin, "sendmail");
  writeFileSync(
    sendmail,
    `#!/bin/sh
dir="${scratch}"
n=1
while [ -e "$dir/mail-$n.eml" ]; do n=$((n+1)); done
cat > "$dir/mail-$n.eml"
exit 0
`,
  );
  chmodSync(sendmail, 0o755);
  const port = await freePort();
  const proc = spawn("bun", ["run", join(import.meta.dirname, "server.ts")], {
    cwd: import.meta.dirname,
    env: {
      ...process.env,
      PORT: String(port),
      PATH: `${bin}:${process.env.PATH}`,
      PGP_PUBKEY_FILE: join(import.meta.dirname, "..", "static", "jim.asc"),
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  const errChunks: Buffer[] = [];
  proc.stderr.on("data", (c) => errChunks.push(c as Buffer));
  try {
    await waitForListen(proc);
    for (const n of [1, 2]) {
      const res = await postOnce(port);
      assert.equal(res.status, 303, `post ${n} status`);
      assert.equal(res.headers.get("location"), "/contact/?status=sent");
      const emlPath = join(scratch, `mail-${n}.eml`);
      assert.equal(existsSync(emlPath), true, `expected ${emlPath}`);
      const eml = readFileSync(emlPath, "utf8");
      assert.match(eml, /-----BEGIN PGP MESSAGE-----/);
      assert.match(eml, /multipart\/encrypted/);
      assert.doesNotMatch(eml, new RegExp(BODY));
      assert.doesNotMatch(eml, new RegExp(FILE1));
      assert.doesNotMatch(eml, new RegExp(FILE2));
    }
  } catch (e) {
    const err = Buffer.concat(errChunks).toString();
    throw new Error(`${e}\nstderr: ${err}`);
  } finally {
    proc.kill("SIGTERM");
    await new Promise((r) => proc.once("close", r));
  }
});
