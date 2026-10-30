"use client";

import { useEffect, useRef } from "react";
import { scentEmoji, type Customer } from "@/lib/data";

const statuses: Customer["status"][] = ["lead", "customer", "vip", "banned"];

// Create/edit dialog. `customer` is null when creating a new one.
export default function CustomerForm({
  customer,
  onSave,
  onClose,
}: {
  customer: Customer | null;
  onSave: (fields: Omit<Customer, "id">) => void;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => dialog.current?.showModal(), []);

  function submit(form: FormData) {
    onSave({
      name: String(form.get("name")).trim(),
      email: String(form.get("email")).trim(),
      favoriteScent: String(form.get("favoriteScent")).trim(),
      lifetimeSlices: Number(form.get("lifetimeSlices")),
      // Scent-o-meter value looks like "pizza-3"
      scentKind: String(form.get("scent")).split("-")[0] as Customer["scentKind"],
      scentIntensity: Number(String(form.get("scent")).split("-")[1]) as Customer["scentIntensity"],
      status: String(form.get("status")) as Customer["status"],
    });
  }

  return (
    <dialog ref={dialog} className="card customer-form" onClose={onClose}>
      <form action={submit}>
        <h2>{customer ? `Edit ${customer.name}` : "New customer"}</h2>
        <label>
          Name
          <input name="name" defaultValue={customer?.name} required />
        </label>
        <label>
          Email
          <input name="email" type="email" defaultValue={customer?.email} required />
        </label>
        <label>
          Favorite scent
          <input name="favoriteScent" defaultValue={customer?.favoriteScent} required />
        </label>
        <label>
          Lifetime slices
          <input name="lifetimeSlices" type="number" min={0} defaultValue={customer?.lifetimeSlices ?? 0} required />
        </label>
        <label>
          Scent-o-meter
          <select name="scent" defaultValue={`${customer?.scentKind ?? "gas"}-${customer?.scentIntensity ?? 3}`}>
            {(["gas", "pizza"] as const).flatMap((kind) =>
              [1, 2, 3, 4, 5].map((n) => (
                <option key={`${kind}-${n}`} value={`${kind}-${n}`}>
                  {scentEmoji[kind].repeat(n)}
                </option>
              )),
            )}
          </select>
        </label>
        <label>
          Status
          <select name="status" defaultValue={customer?.status ?? "lead"}>
            {statuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <div className="form-actions">
          <button type="button" className="secondary" onClick={() => dialog.current?.close()}>
            Cancel
          </button>
          <button>Save</button>
        </div>
      </form>
    </dialog>
  );
}
