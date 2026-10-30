// Seed data for the Pizza-Perfume Store CRM. Hackers: replace with a real store if you dare.
import { fakeOrders } from "./fakeOrders";

export interface Customer {
  id: number;
  name: string;
  email: string;
  favoriteScent: string;
  lifetimeSlices: number;
  scentIntensity: 1 | 2 | 3 | 4 | 5; // how strongly they smell of pizza-perfume
  scentKind?: "gas" | "pizza"; // what the Scent-o-meter shows (defaults to gas)
  status: "lead" | "customer" | "vip" | "banned";
}

export interface Product {
  sku: string;
  name: string;
  kind: "pizza" | "perfume" | "both";
  topNotes: string;
  price: number;
}

// One order, owned by a customer's email. Feeds the order mosaic.
export interface Order {
  id: number;
  email: string;
  kind: "pizza" | "perfume";
  at: string; // ISO timestamp of the order
}

// A roulette win, stored in the browser database's `prizes` table.
export interface Prize {
  id: number;
  customerId: number; // the Customer who won it
  prize: string;
  kind: "pizza" | "perfume";
  wonAt: string; // exact ISO datetime of the spin
}

// HACK: thank you, Lady Patchouli Extra Cheese, for spinning this wheel.
export interface RouletteSlot {
  label: string;
  emoji: string;
  kind: "pizza" | "perfume" | "lose";
}

// 4 pizzas, 4 perfumes, 2 consolation-free zones, interleaved around the wheel.
export const rouletteSlots: RouletteSlot[] = [
  { label: "Diavola", emoji: "🌶️", kind: "pizza" },
  { label: "Truffle Musk", emoji: "🍄", kind: "perfume" },
  { label: "You didn't win", emoji: "😢", kind: "lose" },
  { label: "Quattro Formaggi", emoji: "🧀", kind: "pizza" },
  { label: "Basil Breeze", emoji: "🌿", kind: "perfume" },
  { label: "Margherita", emoji: "🍅", kind: "pizza" },
  { label: "Burnt Crust Cologne", emoji: "🔥", kind: "perfume" },
  { label: "You didn't win", emoji: "🥲", kind: "lose" },
  { label: "Pineapple Heresy", emoji: "🍍", kind: "pizza" },
  { label: "Oud & Oregano Mist", emoji: "🌫️", kind: "perfume" },
];

export const scentEmoji = { gas: "💨", pizza: "🍕" } as const;

export const customers: Customer[] = [
  { id: 1, name: "Gianna Musk", email: "gianna@example.com", favoriteScent: "Burnt Crust", lifetimeSlices: 412, scentIntensity: 5, scentKind: "pizza", status: "vip" },
  { id: 2, name: "Pierre Pepperoni", email: "pierre@example.com", favoriteScent: "Oud & Oregano", lifetimeSlices: 37, scentIntensity: 4, scentKind: "gas", status: "customer" },
  { id: 3, name: "Bella Basilico", email: "bella@example.com", favoriteScent: "Fresh Basil", lifetimeSlices: 0, scentIntensity: 1, scentKind: "pizza", status: "lead" },
  { id: 4, name: "Sal Sandalwood", email: "sal@example.com", favoriteScent: "Sandalwood Cheese", lifetimeSlices: 128, scentIntensity: 3, scentKind: "pizza", status: "customer" },
				{ id: 5, name: "Dr. Anchovy", email: "anchovy@example.com", favoriteScent: "Low Tide", lifetimeSlices: 9, scentIntensity: 5, scentKind: "gas", status: "banned" },
];

export const products: Product[] = [
  { sku: "PZ-005", name: "Margherita No. 5", kind: "both", topNotes: "tomato, jasmine, regret", price: 89 },
  { sku: "PZ-007", name: "Eau de Calzone", kind: "perfume", topNotes: "folded dough, bergamot", price: 120 },
  { sku: "PZ-013", name: "Quattro Formaggi Intense", kind: "pizza", topNotes: "four cheeses, one musk", price: 18 },
  { sku: "PZ-042", name: "Pepperoni Patchouli", kind: "both", topNotes: "spice, patchouli, grease", price: 64 },
  { sku: "PZ-099", name: "Vesuvio Smoke Parfum", kind: "perfume", topNotes: "volcanic ash, oregano", price: 210 },
];

export const orders: Order[] = fakeOrders(customers);
