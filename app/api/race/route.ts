import { getRaceState } from "@/lib/race";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const state = await getRaceState({ start: params.get("start"), demo: params.get("demo") === "1" });
  return Response.json(state, { headers: { "Cache-Control": "no-store" } });
}
