"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Customer, Order } from "@/lib/data";
import { useTable } from "@/lib/db";

const colors = { pizza: "245, 196, 0", perfume: "123, 63, 160" }; // yellow, purple (RGB)
const levels = [0.3, 0.5, 0.75, 1]; // opacity by how busy the day was
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

interface Cell {
  date: Date;
  inYear: boolean;
  pizza: number;
  perfume: number;
}

// One column per week (Sun–Sat), covering Jan 1 to Dec 31 of `year`.
function buildWeeks(year: number, orders: Order[]): Cell[][] {
  const counts = new Map<string, { pizza: number; perfume: number }>();
  for (const o of orders) {
    const key = dayKey(new Date(o.at));
    const c = counts.get(key) ?? { pizza: 0, perfume: 0 };
    c[o.kind]++;
    counts.set(key, c);
  }
  const weeks: Cell[][] = [];
  const day = new Date(year, 0, 1);
  day.setDate(day.getDate() - day.getDay()); // back to Sunday
  while (day.getFullYear() <= year) {
    const week: Cell[] = [];
    for (let i = 0; i < 7; i++) {
      const c = counts.get(dayKey(day)) ?? { pizza: 0, perfume: 0 };
      week.push({ date: new Date(day), inYear: day.getFullYear() === year, ...c });
      day.setDate(day.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

// A customer's orders for the current year, GitHub-contributions style.
export default function MosaicDialog({ customer, onClose }: { customer: Customer; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => dialog.current?.showModal(), []);
  const orders = useTable("orders");
  // The year comes from the browser clock, so wait for it to avoid a hydration mismatch.
  const [year, setYear] = useState<number | null>(null);
  useEffect(() => setYear(new Date().getFullYear()), []);

  const weeks = useMemo(
    () => (year ? buildWeeks(year, orders.filter((o) => o.email === customer.email)) : []),
    [year, orders, customer.email],
  );
  const busiest = Math.max(1, ...weeks.flat().map((c) => c.pizza + c.perfume));
  const yearOrders = weeks.flat().filter((c) => c.inYear);
  const pizzas = yearOrders.reduce((n, c) => n + c.pizza, 0);
  const perfumes = yearOrders.reduce((n, c) => n + c.perfume, 0);

  function style(c: Cell) {
    const total = c.pizza + c.perfume;
    if (!c.inYear) return { visibility: "hidden" as const };
    if (!total) return undefined;
    const level = levels[Math.ceil((total / busiest) * levels.length) - 1];
    return { background: `rgba(${colors[c.pizza >= c.perfume ? "pizza" : "perfume"]}, ${level})` };
  }

  return (
    <dialog ref={dialog} className="card mosaic-dialog" onClose={onClose}>
      <h2>
        🧩 {customer.name} · {year}
      </h2>
      <p className="muted">
        {pizzas + perfumes} orders · 🍕 {pizzas} pizzas · 💐 {perfumes} perfumes
      </p>
      {year && (
        <div className="mosaic-scroll">
          <div className="mosaic-months">
            {weeks.map((week, i) => {
              const first = week.find((c) => c.inYear && c.date.getDate() === 1);
              return <span key={i}>{first ? months[first.date.getMonth()] : ""}</span>;
            })}
          </div>
          <div className="mosaic">
            {weeks.flat().map((c) => (
              <span
                key={c.date.toISOString()}
                className="mosaic-cell"
                style={style(c)}
                title={`${c.date.toDateString()}: ${c.pizza} 🍕 · ${c.perfume} 💐`}
              />
            ))}
          </div>
        </div>
      )}
      <div className="mosaic-legend">
        <span>Less</span>
        {(["pizza", "perfume"] as const).map((kind) => (
          <span key={kind} className="mosaic-legend-group">
            {levels.map((l) => (
              <span key={l} className="mosaic-cell" style={{ background: `rgba(${colors[kind]}, ${l})` }} />
            ))}
            {kind === "pizza" ? "🍕" : "💐"}
          </span>
        ))}
        <span>More</span>
      </div>
      <div className="form-actions">
        <button type="button" onClick={() => dialog.current?.close()}>
          Close
        </button>
      </div>
    </dialog>
  );
}
