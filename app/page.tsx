import Hippodrome from "@/components/Hippodrome";
import { getRaceState } from "@/lib/race";

export default async function RacePage({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const start = typeof params.start === "string" ? params.start : null;
  const demo = params.demo === "1";
  const query = new URLSearchParams({ ...(start && { start }), ...(demo && { demo: "1" }) }).toString();
  const initial = await getRaceState({ start, demo });
  return <Hippodrome initial={initial} query={query ? `?${query}` : ""} />;
}
