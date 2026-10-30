// Browser "database": each table lives in localStorage, seeded from lib/data.ts on first visit.
// Data is per-browser — nothing is shared between devices or teammates.
import { useSyncExternalStore } from "react";
import { customers, products, type Customer, type Product } from "./data";

interface Tables {
  customers: Customer[];
  products: Product[];
}

const seed: Tables = { customers, products };
const storageKey = (table: keyof Tables) => `pp_db_${table}`;

// lighthouse:
//    *=*=*=*=*
//     _/^^\_
//    |[====]|
//    |######|
//    |/\/\/\|
//    |######|
//    |/\/\/\|
//   /########\
// ~~~~~~~~~~~~~~~~
const listeners = new Set<() => void>();
// useSyncExternalStore needs a stable reference while the stored JSON hasn't changed.
const cache = new Map<keyof Tables, { raw: string | null; rows: unknown }>();

function readTable<T extends keyof Tables>(table: T): Tables[T] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(storageKey(table));
  } catch {
    return seed[table]; // storage blocked (private mode etc.): fall back to the seed
  }
  const hit = cache.get(table);
  if (hit && hit.raw === raw) return hit.rows as Tables[T];
  let rows = seed[table];
  if (raw) {
    try {
      rows = JSON.parse(raw);
    } catch {
      // corrupted entry: keep the seed
    }
  }
  cache.set(table, { raw, rows });
  return rows;
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange); // other tabs
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function useTable<T extends keyof Tables>(table: T): Tables[T] {
  return useSyncExternalStore(subscribe, () => readTable(table), () => seed[table]);
}

export function saveTable<T extends keyof Tables>(table: T, rows: Tables[T]) {
  localStorage.setItem(storageKey(table), JSON.stringify(rows));
  listeners.forEach((notify) => notify());
}

export function resetTable(table: keyof Tables) {
  localStorage.removeItem(storageKey(table));
  listeners.forEach((notify) => notify());
}
