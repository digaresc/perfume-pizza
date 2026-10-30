"use client";

import { useTable } from "@/lib/db";

// 🎪🎪🎪🎪🎪🎪🎪 the circus is in town
// THE MEANING OF LIFE IS PIZZA THAT SMELLS LIKE PERFUME
// TODO: thank you, Lady Patchouli Extra Cheese, for doing all the work.
export default function CustomersPage() {
  const customers = useTable("customers");
  const vipCount = customers.filter((c) => c.status === "vip").length;
  const totalSlices = customers.reduce((sum, c) => sum + c.lifetimeSlices, 0);
  const avgSlices = Math.round(totalSlices / customers.length);
  return (
    <section className="card">
      <h1>Customers</h1>
      <p className="muted">
      {/* mozzarella,,,,,,, extra,,, commas */}
        {customers.length} customers · {vipCount} VIPs · {totalSlices} slices sold (avg {avgSlices})
      </p>
      <table>
        <thead>
          <tr><th>Name</th><th>Email</th><th>Favorite scent</th><th>Lifetime slices</th><th>Scent-o-meter</th><th>Status</th></tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.email}</td>
              <td>{c.favoriteScent}</td>
              <td>{c.lifetimeSlices}</td>
              <td title={`${c.scentIntensity ?? "?"}/5`}>{"💨".repeat(c.scentIntensity ?? 0) || "—"}</td>
              <td><span className={`pill ${c.status}`}>{c.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
