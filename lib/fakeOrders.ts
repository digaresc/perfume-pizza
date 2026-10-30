// Investor-grade fake order history: deterministic (same on server and browser),
// with weekend rushes, seasonal cravings and a suspiciously good growth curve.
import type { Customer, Order } from "./data";

// How much each customer orders per day, and how much of it is pizza.
const habits: Record<string, { perDay: number; pizzaShare: number; until?: string }> = {
  "gianna@example.com": { perDay: 2.2, pizzaShare: 0.8 },
  "pierre@example.com": { perDay: 1.2, pizzaShare: 0.25 },
  "bella@example.com": { perDay: 0.15, pizzaShare: 0.6 },
  "sal@example.com": { perDay: 1, pizzaShare: 0.5 },
  "anchovy@example.com": { perDay: 0.7, pizzaShare: 0.3, until: "2026-08-15" }, // banned
};

const FIRST_DAY = Date.UTC(2026, 0, 1);
const LAST_DAY = Date.UTC(2026, 9, 29);
const DAY = 86_400_000;

export function fakeOrders(customers: Customer[]): Order[] {
  let state = 5; // tiny seeded PRNG so every render agrees
  const rand = () => (state = (state * 16807) % 2147483647) / 2147483647;
  const orders: Order[] = [];

  for (let day = FIRST_DAY; day <= LAST_DAY; day += DAY) {
    const date = new Date(day);
    const month = date.getUTCMonth();
    const weekend = [5, 6].includes(date.getUTCDay()) ? 1.8 : 1; // Fri/Sat rush
    const growth = 0.5 + (day - FIRST_DAY) / (LAST_DAY - FIRST_DAY); // up and to the right
    const perfumeSeason = month === 1 ? 0.35 : 0; // Valentine's
    const pizzaSeason = month >= 5 && month <= 7 ? 0.2 : 0; // summer

    for (const { email } of customers) {
      const habit = habits[email];
      if (!habit || (habit.until && day > Date.parse(habit.until))) continue;
      // Random amount around the expected rate; the fraction becomes a chance of one more order.
      const expected = rand() * 2 * habit.perDay * weekend * growth;
      const count = Math.floor(expected) + (rand() < expected % 1 ? 1 : 0);
      for (let i = 0; i < count; i++) {
        const pizzaShare = habit.pizzaShare + pizzaSeason - perfumeSeason;
        const at = day + (11 + rand() * 12) * 3_600_000; // open 11:00–23:00
        orders.push({
          id: orders.length + 1,
          email,
          kind: rand() < pizzaShare ? "pizza" : "perfume",
          at: new Date(at).toISOString(),
        });
      }
    }
  }
  return orders;
}
