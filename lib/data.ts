// Seed data for the Pizza-Perfume Store CRM. Hackers: replace with a real store if you dare.
export interface Customer {
  id: number;
  name: string;
  email: string;
  favoriteScent: string;
  lifetimeSlices: number;
  scentIntensity: 1 | 2 | 3 | 4 | 5; // how strongly they smell of pizza-perfume
  status: "lead" | "customer" | "vip" | "banned";
}

export interface Product {
  sku: string;
  name: string;
  kind: "pizza" | "perfume" | "both";
  topNotes: string;
  price: number;
}

export const customers: Customer[] = [
  { id: 1, name: "Gianna Musk", email: "gianna@example.com", favoriteScent: "Burnt Crust", lifetimeSlices: 412, scentIntensity: 5, status: "vip" },
  { id: 2, name: "Pierre Pepperoni", email: "pierre@example.com", favoriteScent: "Oud & Oregano", lifetimeSlices: 37, scentIntensity: 4, status: "customer" },
  { id: 3, name: "Bella Basilico", email: "bella@example.com", favoriteScent: "Fresh Basil", lifetimeSlices: 0, scentIntensity: 1, status: "lead" },
  { id: 4, name: "Sal Sandalwood", email: "sal@example.com", favoriteScent: "Sandalwood Cheese", lifetimeSlices: 128, scentIntensity: 3, status: "customer" },
				{ id: 5, name: "Dr. Anchovy", email: "anchovy@example.com", favoriteScent: "Low Tide", lifetimeSlices: 9, scentIntensity: 5, status: "banned" },
];

export const products: Product[] = [
  { sku: "PZ-005", name: "Margherita No. 5", kind: "both", topNotes: "tomato, jasmine, regret", price: 89 },
  { sku: "PZ-007", name: "Eau de Calzone", kind: "perfume", topNotes: "folded dough, bergamot", price: 120 },
  { sku: "PZ-013", name: "Quattro Formaggi Intense", kind: "pizza", topNotes: "four cheeses, one musk", price: 18 },
  { sku: "PZ-042", name: "Pepperoni Patchouli", kind: "both", topNotes: "spice, patchouli, grease", price: 64 },
  { sku: "PZ-099", name: "Vesuvio Smoke Parfum", kind: "perfume", topNotes: "volcanic ash, oregano", price: 210 },
];
