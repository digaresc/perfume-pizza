import { createHmac, timingSafeEqual } from "node:crypto";
import { invalidateRaceCache } from "@/lib/race";

// Optional GitHub webhook (content type: application/json, events: Pull requests).
// The race is computed from the GitHub API, so all this does is drop the cache
// so a merge shows up on the projector within one poll instead of one cache TTL.
export async function POST(request: Request) {
  const body = await request.text();
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (secret) {
    const expected = Buffer.from(`sha256=${createHmac("sha256", secret).update(body).digest("hex")}`);
    const given = Buffer.from(request.headers.get("x-hub-signature-256") ?? "");
    if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
      return Response.json({ error: "bad signature" }, { status: 401 });
    }
  }

  const event = request.headers.get("x-github-event");
  if (event === "ping") return Response.json({ ok: true, pong: "🍕" });

  if (event === "pull_request") {
    const payload = JSON.parse(body);
    invalidateRaceCache();
    return Response.json({ ok: true, action: payload.action, merged: payload.pull_request?.merged ?? false });
  }
  return Response.json({ ok: true, ignored: event });
}
