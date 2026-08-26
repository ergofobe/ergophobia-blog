import * as openpgp from "openpgp";

export const MAX_ATTACHMENTS = 8;
export const MAX_TOTAL_BYTES = 8 * 1024 * 1024;

export type Attachment = {
  filename: string;
  contentType: string;
  bytes: Uint8Array;
};

export type ContactMessage = {
  name: string;
  email: string;
  subject: string;
  body: string;
  attachments: Attachment[];
};

export type MailOpts = {
  to: string;
  from: string;
  publicKeyArmored: string;
};

function oneLine(value: string): string {
  return value.replace(/[\r\n]+/g, " ").slice(0, 200);
}

export function safeFilename(name: string): string {
  const base = name.replace(/[\r\n"]/g, "").split(/[/\\]/).pop()?.trim() || "";
  return (base || "attachment").slice(0, 150);
}

function safeContentType(value: string): string {
  const s = value.trim().toLowerCase();
  if (/^[a-z0-9!#$&^_.+-]+\/[a-z0-9!#$&^_.+-]+$/.test(s)) return s;
  return "application/octet-stream";
}

function randomBoundary(prefix: string): string {
  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${prefix}_${hex}`;
}

function uint8ToBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64");
}

function foldBase64(b64: string): string {
  return b64.replace(/(.{76})/g, "$1\r\n").replace(/\r\n$/, "");
}

function buildInnerMime(msg: ContactMessage): string {
  const boundary = randomBoundary("inner");
  const parts: string[] = [
    "MIME-Version: 1.0",
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: 8bit",
    "",
    `From: ${msg.name} <${msg.email}>`,
    "",
    msg.body,
    "",
  ];
  for (const att of msg.attachments) {
    const filename = safeFilename(att.filename);
    const ct = safeContentType(att.contentType);
    parts.push(
      `--${boundary}`,
      `Content-Type: ${ct}; name="${filename}"`,
      "Content-Transfer-Encoding: base64",
      `Content-Disposition: attachment; filename="${filename}"`,
      "",
      foldBase64(uint8ToBase64(att.bytes)),
      "",
    );
  }
  parts.push(`--${boundary}--`, "");
  return parts.join("\r\n");
}

export async function buildEncryptedMail(msg: ContactMessage, opts: MailOpts): Promise<string> {
  const inner = buildInnerMime(msg);
  const publicKey = await openpgp.readKey({ armoredKey: opts.publicKeyArmored });
  const encrypted = await openpgp.encrypt({
    message: await openpgp.createMessage({ text: inner }),
    encryptionKeys: publicKey,
  });
  const armored = (typeof encrypted === "string" ? encrypted : new TextDecoder().decode(encrypted)).trim();
  const boundary = randomBoundary("pgp");
  return [
    `From: ${oneLine(msg.name)} via contact <${opts.from}>`,
    `To: ${opts.to}`,
    `Reply-To: ${oneLine(msg.email)}`,
    `Subject: [ergophobia.org] ${oneLine(msg.subject)}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/encrypted; protocol="application/pgp-encrypted"; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    "Content-Type: application/pgp-encrypted",
    "",
    "Version: 1",
    "",
    `--${boundary}`,
    `Content-Type: application/octet-stream; name="encrypted.asc"`,
    `Content-Disposition: inline; filename="encrypted.asc"`,
    "",
    armored,
    "",
    `--${boundary}--`,
    "",
  ].join("\r\n");
}
