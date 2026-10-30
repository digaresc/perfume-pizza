"use client";

import { useMemo, useState } from "react";
import { scentEmoji, type Customer } from "@/lib/data";
import { saveTable, useTable } from "@/lib/db";
import CustomerForm from "./CustomerForm";
import MosaicDialog from "./MosaicDialog";
import RouletteDialog from "./RouletteDialog";

// 🎪🎪🎪🎪🎪🎪🎪 the circus is in town
// THE MEANING OF LIFE IS PIZZA THAT SMELLS LIKE PERFUME
// TODO: thank you, Lady Patchouli Extra Cheese, for doing all the work.
export default function CustomersPage() {
  const customers = useTable("customers");
  const orders = useTable("orders");
  const orderCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const o of orders) counts.set(o.email, (counts.get(o.email) ?? 0) + 1);
    return counts;
  }, [orders]);
  // "new" = creating, a Customer = editing it, null = dialog closed
  const [editing, setEditing] = useState<Customer | "new" | null>(null);
  const [spinning, setSpinning] = useState<Customer | null>(null);
  const [mosaicFor, setMosaicFor] = useState<Customer | null>(null);
  const vipCount = customers.filter((c) => c.status === "vip").length;
  const totalSlices = customers.reduce((sum, c) => sum + c.lifetimeSlices, 0);
  const avgSlices = Math.round(totalSlices / customers.length);

  function save(fields: Omit<Customer, "id">) {
    if (editing === "new") {
      const id = Math.max(0, ...customers.map((c) => c.id)) + 1;
      saveTable("customers", [...customers, { id, ...fields }]);
    } else if (editing) {
      saveTable("customers", customers.map((c) => (c.id === editing.id ? { ...c, ...fields } : c)));
    }
    setEditing(null);
  }

  return (
    <section className="card">
      <div className="card-header">
        <h1>Customers</h1>
        <button className="add-button" onClick={() => setEditing("new")}>
          Add customer +
        </button>
      </div>
      <p className="muted">
      {/* mozzarella,,,,,,, extra,,, commas */}
        {customers.length} customers · {vipCount} VIPs · {totalSlices} slices sold (avg {avgSlices})
      </p>
      <table>
        <thead>
          <tr><th>Name</th><th>Email</th><th>Favorite scent</th><th>Lifetime slices</th><th>Orders</th><th>Scent-o-meter</th><th>Status</th><th>Roulette</th><th>Mosaic</th></tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id} className="clickable" tabIndex={0} onClick={() => setEditing(c)} onKeyDown={(e) => e.key === "Enter" && setEditing(c)}>
              <td>{c.name}</td>
              <td>{c.email}</td>
              <td>{c.favoriteScent}</td>
              <td>{c.lifetimeSlices}</td>
              <td>{orderCounts.get(c.email) ?? 0}</td>
              <td title={`${c.scentIntensity ?? "?"}/5`}>{scentEmoji[c.scentKind ?? "gas"].repeat(c.scentIntensity ?? 0) || "—"}</td>
              <td><span className={`pill ${c.status}`}>{c.status}</span></td>
              <td>
                {/* stopPropagation so spinning doesn't also open the edit form */}
                <button
                  className="spin-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSpinning(c);
                  }}
                  onKeyDown={(e) => e.stopPropagation()}
                >
                  🎰 Spin
                </button>
              </td>
              <td>
                <button
                  className="spin-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMosaicFor(c);
                  }}
                  onKeyDown={(e) => e.stopPropagation()}
                >
                  🧩 Mosaic
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {editing && (
        <CustomerForm customer={editing === "new" ? null : editing} onSave={save} onClose={() => setEditing(null)} />
      )}
      {spinning && <RouletteDialog customer={spinning} onClose={() => setSpinning(null)} />}
      {mosaicFor && <MosaicDialog customer={mosaicFor} onClose={() => setMosaicFor(null)} />}
    </section>
  );
}
