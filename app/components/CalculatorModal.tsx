"use client";

import { useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  usdBcv: number | null;
  eurBcv: number | null;
  usdt: number | null;
};

export default function CalculatorModal({
  open,
  onClose,
  usdBcv,
  eurBcv,
  usdt,
}: Props) {
  const [tab, setTab] = useState<"USD" | "EUR" | "USDT">("USD");
  const [value, setValue] = useState("1");

  if (!open) return null;

  const amount = Number(value) || 0;

  const bcv =
    tab === "USD" ? usdBcv ?? 0 :
    tab === "EUR" ? eurBcv ?? 0 :
    usdt ?? 0;

  const p2p = usdt ?? 0;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.65)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 380,
          background: "linear-gradient(180deg,#2563eb,#0f172a)",
          borderRadius: 18,
          padding: 20,
          color: "#fff",
        }}
      >
        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <strong>Calculadora</strong>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#fff", fontSize: 18 }}>✕</button>
        </div>

        {/* TABS */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {["USD", "EUR", "USDT"].map(t => (
            <button
              key={t}
              onClick={() => setTab(t as any)}
              style={{
                flex: 1,
                padding: 8,
                borderRadius: 10,
                border: "none",
                background: tab === t ? "#1e40af" : "rgba(255,255,255,0.15)",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* INPUT */}
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="Monto"
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 10,
            border: "none",
            fontSize: 18,
            marginBottom: 14,
          }}
        />

        {/* RESULTADOS */}
        <div style={{ lineHeight: 1.6 }}>
          <p>BCV: {(bcv * amount).toFixed(2)} Bs</p>
          <p>P2P: {(p2p * amount).toFixed(2)} Bs</p>
          <p>
            Diferencia: {((p2p - bcv) * amount).toFixed(2)} Bs
          </p>
        </div>
      </div>
    </div>
  );
}
