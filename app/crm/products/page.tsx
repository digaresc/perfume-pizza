"use client";

import { useTable } from "@/lib/db";
import { formatPrice } from "@/lib/format";

export default function ProductsPage() {
  const products = useTable("products");
  return (
    <section className="card">
      <h1>Products</h1>
      <table>
        <thead>
          <tr><th>SKU</th><th>Name</th><th>Kind</th><th>Top notes</th><th>Price</th></tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.sku}>
              <td>{p.sku}</td>
              <td>{p.name}</td>
              <td>{p.kind}</td>
              <td>{p.topNotes}</td>
              <td>{formatPrice(p.price)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
