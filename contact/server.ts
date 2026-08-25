const PORT = Number(process.env.PORT || 3000);
const TO = process.env.MAIL_TO || "jim@ergophobia.org";
const FROM = process.env.MAIL_FROM || "contact@ergophobia.org";
const hits = new Map<string, number[]>();

function allowed(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000;
  const prev = (hits.get(ip) || []).filter((t) => now - t < windowMs);
  if (prev.length >= 8) {
    hits.set(ip, prev);
    return false;
  }
  prev.push(now);
  hits.set(ip, prev);
  return true;
}

function redirect(status: string, httpStatus = 303): Response {
  return new Response(null, {
    status: httpStatus,
    headers: { location: `/contact/?status=${status}` },
  });
}

function header(name: string, value: string): string {
  const v = value.replace(/[\r\n]+/g, " ").slice(0, 200);
  return `${name}: ${v}`;
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

Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname !== "/contact" && url.pathname !== "/contact/") {
      return new Response("not found", { status: 404 });
    }
    if (req.method !== "POST") return new Response("method", { status: 405 });

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!allowed(ip)) return redirect("rate");

    const form = await req.formData();
    if (String(form.get("company") || "")) return redirect("sent");
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
