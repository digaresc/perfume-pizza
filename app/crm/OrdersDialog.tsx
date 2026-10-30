"use client";

import { useEffect, useRef, useState } from "react";
import type { Customer } from "@/lib/data";
import { useTable } from "@/lib/db";

const LIMIT = 50;

// A customer's most recent orders; Sommelier creations show their photo.
export default function OrdersDialog({ customer, onClose }: { customer: Customer; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => dialog.current?.showModal(), []);
  const orders = useTable("orders");
  const [onlySommelier, setOnlySommelier] = useState(false);
  // "Now" comes from the browser clock, so wait for it to avoid a hydration mismatch.
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => setNow(new Date().toISOString()), []);

  const latest = now
    ? orders
        .filter((o) => o.email === customer.email && o.at <= now && (!onlySommelier || o.name))
        .sort((a, b) => b.at.localeCompare(a.at))
        .slice(0, LIMIT)
    : [];

  return (
    <dialog ref={dialog} className="card orders-dialog" onClose={onClose}>
      <div className="card-header">
        <h2>📦 {customer.name}'s latest orders</h2>
        <label className="muted">
          <input type="checkbox" checked={onlySommelier} onChange={(e) => setOnlySommelier(e.target.checked)} /> Only ✨
          Sommelier creations
        </label>
      </div>
      <p className="muted">The {LIMIT} most recent orders, newest first.</p>
      <table>
        <thead>
          <tr><th></th><th>When</th><th>Order</th></tr>
        </thead>
        <tbody>
          {latest.map((o) => (
            <tr key={o.id}>
              <td>
                {o.image ? (
                  <img className="order-thumb" src={o.image} alt={o.name ?? ""} />
                ) : (
                  <span className="order-thumb">{o.kind === "pizza" ? "🍕" : "💐"}</span>
                )}
              </td>
              <td>{new Date(o.at).toLocaleString()}</td>
              <td>{o.name ? `✨ ${o.name}` : o.kind}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {now && latest.length === 0 && (
        <p className="muted">{onlySommelier ? "No Sommelier creations yet. Go order one!" : "No orders yet."}</p>
      )}
      <div className="form-actions">
        <button type="button" onClick={() => dialog.current?.close()}>
          Close
        </button>
      </div>
    </dialog>
  );
}
