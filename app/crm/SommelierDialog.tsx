"use client";

import { useEffect, useRef, useState } from "react";
import type { Customer } from "@/lib/data";
import { saveTable, useTable } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { nextStep, paint, type Answered, type SommelierStep } from "./sommelier/actions";

// Shrinks the generated photo so it fits in browser storage (~15 KB instead of ~100 KB).
async function thumbnail(dataUrl: string, size = 256): Promise<string> {
  const img = new Image();
  img.src = dataUrl;
  await img.decode();
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  canvas.getContext("2d")?.drawImage(img, 0, 0, size, size);
  return canvas.toDataURL("image/jpeg", 0.7);
}

// AI interview → a custom pizza-perfume, with a fresh photo at every step.
export default function SommelierDialog({ customer, onClose }: { customer: Customer; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const orders = useTable("orders");
  const [history, setHistory] = useState<Answered[]>([]);
  const [step, setStep] = useState<SommelierStep | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [thinking, setThinking] = useState(false);
  const [painting, setPainting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [custom, setCustom] = useState("");
  const [ordered, setOrdered] = useState(false);
  const paintId = useRef(0); // ignore images that arrive after a newer step
  const started = useRef(false); // dev Strict Mode runs effects twice; ask only once

  async function ask(answers: Answered[]) {
    setThinking(true);
    setError(null);
    const mine = orders.filter((o) => o.email === customer.email);
    const result = await nextStep(
      {
        name: customer.name,
        favoriteScent: customer.favoriteScent,
        scentKind: customer.scentKind ?? "gas",
        scentIntensity: customer.scentIntensity,
        pizzaOrders: mine.filter((o) => o.kind === "pizza").length,
        perfumeOrders: mine.filter((o) => o.kind === "perfume").length,
      },
      answers,
    );
    setThinking(false);
    if (!result.ok) return setError(result.error);
    setStep(result.value);
    // The question shows right away; the photo fades in when it's ready.
    const id = ++paintId.current;
    setPainting(true);
    const picture = await paint(result.value.imagePrompt);
    if (id !== paintId.current) return;
    setPainting(false);
    if (picture.ok) setImage(picture.value);
  }

  useEffect(() => {
    dialog.current?.showModal();
    if (started.current) return;
    started.current = true;
    ask([]);
  }, []);

  function answer(text: string) {
    if (!step || !text.trim()) return;
    const answers = [...history, { question: step.question, answer: text.trim() }];
    setHistory(answers);
    setCustom("");
    ask(answers);
  }

  async function order() {
    if (!pizza) return;
    const id = Math.max(0, ...orders.map((o) => o.id)) + 1;
    const base = { id, email: customer.email, kind: "pizza" as const, at: new Date().toISOString(), name: pizza.name };
    try {
      saveTable("orders", [...orders, { ...base, image: image ? await thumbnail(image) : undefined }]);
    } catch {
      saveTable("orders", [...orders, base]); // storage full: keep the order, drop the photo
    }
    setOrdered(true);
  }

  const pizza = step?.done ? step.pizza : null;

  return (
    <dialog ref={dialog} className="card sommelier" onClose={onClose}>
      <h2>✨ Scent Sommelier · {customer.name}</h2>
      <div className={`sommelier-photo${painting ? " painting" : ""}`}>
        {image ? <img src={image} alt={step?.imagePrompt ?? ""} /> : <span>🎨</span>}
        {painting && <span className="sommelier-badge">painting…</span>}
      </div>

      {error && <p className="error">{error}</p>}
      {thinking && <p className="muted">👃 The sommelier is sniffing…</p>}

      {!thinking && step && !pizza && (
        <>
          <p className="sommelier-question">
            <span className="muted">Question {history.length + 1}</span>
            <br />
            {step.question}
          </p>
          <div className="sommelier-options">
            {step.options.map((o) => (
              <button key={o} type="button" onClick={() => answer(o)}>
                {o}
              </button>
            ))}
          </div>
          <form
            className="sommelier-custom"
            onSubmit={(e) => {
              e.preventDefault();
              answer(custom);
            }}
          >
            <input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="…or type your own answer" maxLength={80} />
            <button disabled={!custom.trim()}>Answer</button>
          </form>
        </>
      )}

      {!thinking && pizza && (
        <div className="sommelier-pizza">
          <h3>
            {pizza.name} · {formatPrice(pizza.price)}
          </h3>
          <p>
            <em>{pizza.tastingNote}</em>
          </p>
          <p>🍕 {pizza.toppings.join(", ")}</p>
          <p className="muted">
            Top: {pizza.topNote} · Heart: {pizza.heartNote} · Base: {pizza.baseNote}
          </p>
        </div>
      )}

      <div className="form-actions">
        {error && (
          <button type="button" className="secondary" onClick={() => ask(history)}>
            Try again
          </button>
        )}
        <button type="button" className="secondary" onClick={() => dialog.current?.close()}>
          Close
        </button>
        {pizza && (
          <button type="button" onClick={order} disabled={ordered || painting}>
            {ordered ? "Ordered ✓" : painting ? "Finishing the photo…" : "Order it 🍕"}
          </button>
        )}
      </div>
    </dialog>
  );
}
