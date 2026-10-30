"use client";

import { useEffect, useRef, useState } from "react";
import { rouletteSlots, type Customer, type RouletteSlot } from "@/lib/data";
import { saveTable, useTable } from "@/lib/db";

const SLICE = 360 / rouletteSlots.length;
const R = 100; // wheel radius in SVG units
const colors = { pizza: "#b3261e", perfume: "#7b3fa0", lose: "#8a6f5c" };

// Point on the wheel `deg` degrees clockwise from 12 o'clock.
function point(deg: number, r: number) {
  const rad = (deg * Math.PI) / 180;
  return `${R + r * Math.sin(rad)} ${R - r * Math.cos(rad)}`;
}

export default function RouletteDialog({ customer, onClose }: { customer: Customer; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => dialog.current?.showModal(), []);
  const prizes = useTable("prizes");
  const [rotation, setRotation] = useState(0);
  const [target, setTarget] = useState<number | null>(null); // slot index while spinning
  const [result, setResult] = useState<RouletteSlot | null>(null);

  function spin() {
    const index = Math.floor(Math.random() * rouletteSlots.length);
    // Land the slot's center under the pointer, a little off-center so it looks natural.
    const jitter = (Math.random() - 0.5) * SLICE * 0.7;
    const landing = 360 - (index * SLICE + SLICE / 2) + jitter;
    const current = ((rotation % 360) + 360) % 360;
    setRotation(rotation + 5 * 360 + ((landing - current + 360) % 360));
    setTarget(index);
    setResult(null);
  }

  function landed() {
    if (target === null) return;
    const slot = rouletteSlots[target];
    setTarget(null);
    setResult(slot);
    if (slot.kind === "lose") return;
    const id = Math.max(0, ...prizes.map((p) => p.id)) + 1;
    saveTable("prizes", [
      ...prizes,
      { id, customerId: customer.id, prize: slot.label, kind: slot.kind, wonAt: new Date().toISOString() },
    ]);
  }

  const won = prizes.filter((p) => p.customerId === customer.id).reverse();

  return (
    <dialog ref={dialog} className="card roulette" onClose={onClose}>
      <h2>🎰 Roulette for {customer.name}</h2>
      <div className="wheel-wrap">
        <div className="wheel-pointer" aria-hidden>▼</div>
        <svg
          viewBox={`0 0 ${R * 2} ${R * 2}`}
          className="wheel"
          style={{ transform: `rotate(${rotation}deg)` }}
          onTransitionEnd={landed}
          role="img"
          aria-label="Prize wheel"
        >
          {rouletteSlots.map((slot, i) => {
            const start = i * SLICE;
            const mid = start + SLICE / 2;
            return (
              <g key={i}>
                <title>{slot.label}</title>
                <path
                  d={`M ${R} ${R} L ${point(start, R)} A ${R} ${R} 0 0 1 ${point(start + SLICE, R)} Z`}
                  fill={colors[slot.kind]}
                  stroke="#fff"
                  strokeWidth={1}
                />
                <text x={R} y={R - R * 0.72} fontSize={16} textAnchor="middle" dominantBaseline="middle" transform={`rotate(${mid} ${R} ${R})`}>
                  {slot.emoji}
                </text>
              </g>
            );
          })}
          <circle cx={R} cy={R} r={14} fill="#fff8ef" />
        </svg>
      </div>
      <p className="roulette-result" aria-live="polite">
        {target !== null
          ? "Spinning…"
          : result
            ? result.kind === "lose"
              ? `${result.emoji} You didn't win. The pizza gods are unmoved.`
              : `${result.emoji} ${customer.name} won ${result.label} (${result.kind})!`
            : "Spin to win a pizza or a perfume."}
      </p>
      <div className="form-actions">
        <button type="button" className="secondary" onClick={() => dialog.current?.close()}>
          Close
        </button>
        <button type="button" onClick={spin} disabled={target !== null}>
          {result ? "Spin again" : "Spin!"}
        </button>
      </div>
      {won.length > 0 && (
        <details className="prize-history">
          <summary>Prizes won ({won.length})</summary>
          <ul>
            {won.map((p) => (
              <li key={p.id}>
                {p.prize} · <span className="muted">{new Date(p.wonAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </dialog>
  );
}
