const PORT = Number(process.env.PORT || 3000);
const TO = process.env.MAIL_TO || "jim@ergophobia.org";
const FROM = process.env.MAIL_FROM || "contact@ergophobia.org";
const WINDOW_MS = 60 * 60 * 1000;
const SWEEP_MS = 60 * 1000;
const MAX_IPS = 50_000;
const hits = new Map<string, number[]>();
let lastSweep = 0;

function sweep(now: number): void {
  if (now - lastSweep < SWEEP_MS) return;
  lastSweep = now;
  for (const [key, times] of hits) {
    if (times.length === 0 || now - times[times.length - 1] >= WINDOW_MS) hits.delete(key);
  }
}

function evictOverflow(): void {
  for (const key of hits.keys()) {
    if (hits.size <= MAX_IPS) return;
    hits.delete(key);
  }
}

function allowed(ip: string): boolean {
  const now = performance.now();
  sweep(now);
  const prev = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  const limited = prev.length >= 8;
  if (!limited) prev.push(now);
  // Re-insert so Map order stays least-recently-seen first, making overflow eviction an LRU.
  hits.delete(ip);
  hits.set(ip, prev);
  evictOverflow();
  return !limited;
}

function redirect(status: string, httpStatus = 303): Response {
  return new Response(null, {
    status: httpStatus,
    headers: { location: `/contact/?status=${status}` },
  });
}

function oneLine(value: string): string {
  return value.replace(/[\r\n]+/g, " ").slice(0, 200);
}

function header(name: string, value: string): string {
  return `${name}: ${oneLine(value)}`;
}

async function sendMail(name: string, email: string, subject: string, body: string): Promise<void> {
  const mime = [
    header("From", `${name} via contact <${FROM}>`),
    header("To", TO),
    header("Reply-To", email),
    header("Subject", `[ergophobia.org] ${subject}`),
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "",
    `From: ${name} <${email}>`,
    "",
    body,
    "",
  ].join("\r\n");
  const proc = Bun.spawn(["sendmail", "-t", "-oi"], { stdin: "pipe", stderr: "pipe" });
  proc.stdin.write(mime);
  proc.stdin.end();
  const err = await new Response(proc.stderr).text();
  const code = await proc.exited;
  if (code !== 0) throw new Error(err || `sendmail exited ${code}`);
}

setInterval(() => sweep(performance.now()), SWEEP_MS).unref();

Bun.serve({
  port: PORT,
  // Caddy proxies to 127.0.0.1:3000. Binding localhost-only keeps the XFF chain
  // unforgeable rather than trusting the cloud firewall to hide this port.
  hostname: "127.0.0.1",
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname !== "/contact" && url.pathname !== "/contact/") {
      return new Response("not found", { status: 404 });
    }
    if (req.method !== "POST") return new Response("method", { status: 405 });

    // Caddy appends the real peer to any client-supplied header, so only the last entry is trustworthy.
    const ip = req.headers.get("x-forwarded-for")?.split(",").pop()?.trim() || "unknown";
    if (!allowed(ip)) return redirect("rate");

    const form = await req.formData();
    if (String(form.get("company") || "")) {
      console.error(`honeypot ip=${oneLine(ip)} email=${oneLine(String(form.get("email") || ""))}`);
      return redirect("sent");
    }
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const subject = String(form.get("subject") || "").trim();
    const body = String(form.get("body") || "").trim();
    if (!name || !email || !subject || !body || !email.includes("@")) {
      return redirect("missing");
    }
    try {
      await sendMail(name, email, subject, body);
    } catch (e) {
      console.error(e);
      return redirect("fail");
    }
    return redirect("sent");
  },
});

console.log(`contact listening on ${PORT}`);
