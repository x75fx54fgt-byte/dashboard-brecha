"use client";

import { useEffect, useMemo, useState } from "react";
import Card from "./components/Card";
import BrechaTripleChart from "./components/BrechaTripleChart";
import CalculatorModal from "./components/CalculatorModal";

const RANGES = [
  { label: "1 min", range: 1, bucket: 1 },
  { label: "5 min", range: 5, bucket: 1 },  
  { label: "15 min", range: 15, bucket: 1 },
  { label: "1 hora", range: 60, bucket: 2 },
  { label: "24 horas", range: 1440, bucket: 5 }, 
  { label: "30 días", range: 43200, bucket: 60 },  
  { label: "6 meses", range: 262800, bucket: 360 },
  { label: "1 año", range: 525600, bucket: 1440 },   
  { label: "5 años", range: 2628000, bucket: 10080 },
];

type HistoryRow = {
  t: number;  
  bcv: number;
  binance: number;
  brecha: number;
};

export default function Home() {
  // tasas
  const [usdBcv, setUsdBcv] = useState<number | null>(null);
  const [eurBcv, setEurBcv] = useState<number | null>(null);
  const [usdt, setUsdt] = useState<number | null>(null);
  const [updatedAt, setUpdatedAt] = useState("--");
  
  // históricos
  const [historyUsd, setHistoryUsd] = useState<HistoryRow[]>([]);
  const [historyEur, setHistoryEur] = useState<HistoryRow[]>([]);
  const [range, setRange] = useState(RANGES[4]);
  
  // resúmenes
  const [summaryUsdDay, setSummaryUsdDay] = useState<any>(null);  
  const [summaryUsdWeek, setSummaryUsdWeek] = useState<any>(null);
  const [summaryEurDay, setSummaryEurDay] = useState<any>(null);  
  const [summaryEurWeek, setSummaryEurWeek] = useState<any>(null);
  
  // predicción
  const [predictionUsd, setPredictionUsd] = useState<any>(null);
  const [predictionEur, setPredictionEur] = useState<any>(null);
  
  // calculadora
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcTab, setCalcTab] = useState<"USD" | "EUR" | "USDT">("USD");
  const [calcValue, setCalcValue] = useState("1");

  const rateBCV = useMemo(() => {
    if (calcTab === "USD") return usdBcv ?? 0;
    if (calcTab === "EUR") return eurBcv ?? 0;
    if (calcTab === "USDT") return usdBcv ?? 0; // USDT usa BCV USD
    return 0;
  }, [calcTab, usdBcv, eurBcv]);

  const amount = Number(calcValue) || 0;

  // Resultados base
  const bcvSelectedResult = rateBCV * amount;
  const bcvUsdResult = (usdBcv ?? 0) * amount;
  const bcvEurResult = (eurBcv ?? 0) * amount;
  const p2pResult = (usdt ?? 0) * amount;

  // Diferencias
  const diffP2PvsBCV = p2pResult - bcvSelectedResult;
  const diffUsdVsEur = bcvUsdResult - bcvEurResult;

  // brechas
  const brechaUsd = useMemo(() => {   
    if (!usdBcv || !usdt) return null;
    return ((usdt - usdBcv) / usdBcv) * 100;
  }, [usdBcv, usdt]);
 
  const brechaEur = useMemo(() => {
    if (!eurBcv || !usdt) return null;
    return ((usdt - eurBcv) / eurBcv) * 100;
  }, [eurBcv, usdt]);
  
  // tasas actuales
  useEffect(() => {
    const loadRates = async () => {
      try {   
        const [bcvRes, binanceRes] = await Promise.all([
          fetch("/api/bcv", { cache: "no-store" }),
          fetch("/api/binance", { cache: "no-store" }),
        ]);
        const bcv = await bcvRes.json();
        const binance = await binanceRes.json();
  
        setUsdBcv(bcv?.usd ?? null);
        setEurBcv(bcv?.eur ?? null);
        setUsdt(binance?.usdt ?? null);
        setUpdatedAt(new Date().toLocaleString());
      } catch {
        setUpdatedAt("--");
      }
    };
    
    loadRates();
    const id = setInterval(loadRates, 60_000);
   return () => clearInterval(id);
  }, []);
    
  // guardar histórico
  useEffect(() => {  
    if (usdBcv && usdt) {
      fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currency: "USD", bcv: usdBcv, binance: usdt }),
      });
    }
    if (eurBcv && usdt) {
      fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currency: "EUR", bcv: eurBcv, binance: usdt }),
      });
    }
  }, [usdBcv, eurBcv, usdt]);
        
  // históricos
  useEffect(() => {
    const loadHistory = async () => {
      const [usdRes, eurRes] = await Promise.all([
        fetch(`/api/history?currency=USD&range=${range.range}&bucket=${range.bucket}`),
        fetch(`/api/history?currency=EUR&range=${range.range}&bucket=${range.bucket}`),
      ]);
      setHistoryUsd(await usdRes.json());
      setHistoryEur(await eurRes.json());
    };
    loadHistory();
  }, [range]);
    
  // resúmenes
  useEffect(() => {
    const load = async (url: string, setter: any) => {  
      try {
        const res = await fetch(url);
        setter(await res.json());
      } catch {
        setter(null);
      }
    };
    load("/api/summary?currency=USD&period=day", setSummaryUsdDay);
    load("/api/summary?currency=USD&period=week", setSummaryUsdWeek);
    load("/api/summary?currency=EUR&period=day", setSummaryEurDay);
    load("/api/summary?currency=EUR&period=week", setSummaryEurWeek);
  }, []);
  
  // predicción
  useEffect(() => {
    const load = async () => {
      try {
        setPredictionUsd(await fetch("/api/prediction?currency=USD").then(r => r.json()));
        setPredictionEur(await fetch("/api/prediction?currency=EUR").then(r => r.json()));

      } catch {
        setPredictionUsd(null);
        setPredictionEur(null);
      }
    };
    load();
  }, []);
  
  return (
    <>
      <main style={{ padding: 24, fontFamily: "Arial", maxWidth: 1100, margin: "0 auto" }}>
        <h1>Dashboard Brecha ✅</h1>
        <p style={{ color: "#777" }}>Histórico persistente en SQLite.</p>
        
        {/* USD */}
        <h3>USD</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: 16 }}>
          <Card title="USD BCV" value={usdBcv ? `${usdBcv.toFixed(2)} Bs` : "--"} subtitle="Fuente: BCV" />
          <Card title="USDT P2P" value={usdt ? `${usdt.toFixed(2)} Bs` : "--"} subtitle="Fuente: Binance P2P" />
          <Card title="Brecha USD %" value={brechaUsd ? `${brechaUsd.toFixed(2)} %` : "--"} subtitle="Cálculo automático" />
        </div>
  
        {/* EUR */}
        <h3 style={{ marginTop: 24 }}>EUR</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: 16 }}>
          <Card title="EUR BCV" value={eurBcv ? `${eurBcv.toFixed(2)} Bs` : "--"} subtitle="Fuente: BCV" />
          <Card title="USDT P2P" value={usdt ? `${usdt.toFixed(2)} Bs` : "--"} subtitle="Fuente: Binance P2P" />
          <Card title="Brecha EUR %" value={brechaEur ? `${brechaEur.toFixed(2)} %` : "--"} subtitle="Cálculo automático" />

        </div> 
        
        <p style={{ marginTop: 12, color: "#777" }}>
          Última actualización: <strong>{updatedAt}</strong>
        </p>
    
        {/* GRÁFICAS */}
        <h3 style={{ marginTop: 32 }}>USD BCV vs USDT vs Brecha</h3>
        <BrechaTripleChart data={historyUsd} />
      
        <h3 style={{ marginTop: 40 }}>EUR BCV vs USDT vs Brecha</h3>
        <BrechaTripleChart data={historyEur} />
        
        {/* RESÚMENES */}
        <h3 style={{ marginTop: 48 }}>Resumen USD</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: 16 }}>
          <Card title="Promedio diario" value={summaryUsdDay ? `${summaryUsdDay.avg_brecha.toFixed(2)} %` : "--"} subtitle="24h" />
          <Card title="Máximo diario" value={summaryUsdDay ? `${summaryUsdDay.max_brecha.toFixed(2)} %` : "--"} subtitle="24h" />
          <Card title="Promedio semanal" value={summaryUsdWeek ? `${summaryUsdWeek.avg_brecha.toFixed(2)} %` : "--"} subtitle="7 días" />
        </div>
        
        <h3 style={{ marginTop: 40 }}>Resumen EUR</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: 16 }}>
          <Card title="Promedio diario" value={summaryEurDay ? `${summaryEurDay.avg_brecha.toFixed(2)} %` : "--"} subtitle="24h" />
          <Card title="Máximo diario" value={summaryEurDay ? `${summaryEurDay.max_brecha.toFixed(2)} %` : "--"} subtitle="24h" />
          <Card title="Promedio semanal" value={summaryEurWeek ? `${summaryEurWeek.avg_brecha.toFixed(2)} %` : "--"} subtitle="7 días" />
        </div>
        
        {/* PREDICCIÓN */}
        <h3 style={{ marginTop: 48 }}>Predicción experta (24h)</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))", gap: 16 }}>
          <Card
            title="USD – Brecha esperada"
            value={
              predictionUsd?.expected_range?.min != null &&
              predictionUsd?.expected_range?.max != null
                ? `${predictionUsd.expected_range.min}% → ${predictionUsd.expected_range.max}%`
                : "Calibrando…"
            }
            subtitle={
              predictionUsd?.direction ?? "Recopilando datos"
            }
          />

          <Card
            title="EUR – Brecha esperada"
            value={
              predictionEur?.expected_range?.min != null &&
              predictionEur?.expected_range?.max != null
                ? `${predictionEur.expected_range.min}% → ${predictionEur.expected_range.max}%`
                : "Calibrando…"
            }
            subtitle={
              predictionEur?.direction ?? "Recopilando datos"
            }
          />
        </div>  
      </main>
        
      {/* BOTÓN */}
      <button
        onClick={() => setShowCalculator(true)}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "#2563eb",
          color: "#fff",
          border: "none",
          fontSize: 24,
          cursor: "pointer",
          zIndex: 500,
        }}
      >
      🧮
      </button>

        
      {/* MODAL CALCULADORA (ESTILO FOTO) */}
      {showCalculator && (
        <div
          onClick={() => setShowCalculator(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: 380,   
              background: "linear-gradient(180deg,#2563eb,#0f172a)",
              borderRadius: 20,
              padding: 20,  
              color: "#fff",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <strong>Calculadora</strong>
              <button onClick={() => setShowCalculator(false)}>✕</button>
            </div>

            {/* TASAS */}
            <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 12 }}>
              💰 USD / BCV: {rateBCV.toLocaleString("es-VE", { maximumFractionDigits: 4 })} Bs
              &nbsp; | &nbsp;
              ₿ P2P: {usdt?.toFixed(2)} Bs
            </div>

            {/* TABS */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {["USD", "EUR", "USDT"].map(t => (
                <button
                  key={t}
                  onClick={() => setCalcTab(t as any)}
                  style={{
                    flex: 1,
                    padding: 8,
                    borderRadius: 10,
                    border: "none",
                    background: calcTab === t ? "#22c55e" : "rgba(255,255,255,.15)",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>

            <input
              type="text"
              inputMode="decimal"
              value={calcValue}
              onChange={e => 
                setCalcValue(e.target.value.replace(",", "."))
             }
              style={{
                width: "100%",
                padding: 14,
                borderRadius: 12,
                border: "none",
                fontSize:20,
                outline: "none",
                marginBottom: 16,
              }}
            />

            {/* RESULTADOS */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 12,
              }}
            >
              {/* 1️⃣ BCV seleccionado */}
              <div style={{ background: "#1e293b", padding: 12, borderRadius: 12 }}>
                BCV {calcTab}:
                <strong>
                  {" "}
                  {bcvSelectedResult.toLocaleString("es-VE", {
                    minimumFractionDigits: 2,
                  })}{" "}
                  Bs
                </strong>
              </div>

              {/* 2️⃣ BCV EUR */}
              <div style={{ background: "#312e81", padding: 12, borderRadius: 12 }}>
                BCV EUR:
                <strong>
                  {" "}
                  {bcvEurResult.toLocaleString("es-VE", {
                    minimumFractionDigits: 2,
                  })}{" "}
                  Bs
                </strong>
              </div>

              {/* 4️⃣ Diferencia P2P vs BCV */}
              <div style={{ background: "#064e3b", padding: 12, borderRadius: 12 }}>
                P2P − BCV:
                <strong>
                  {" "}
                  {diffP2PvsBCV.toLocaleString("es-VE", {
                    minimumFractionDigits: 2,
                  })}{" "}
                  Bs
                </strong>
              </div>

              {/* 5️⃣ Diferencia BCV USD vs EUR */}
              <div style={{ background: "#3f1d1d", padding: 12, borderRadius: 12 }}>
                BCV USD − EUR:
                <strong>
                  {" "}
                  {diffUsdVsEur.toLocaleString("es-VE", {
                    minimumFractionDigits: 2,
                  })}{" "}
                  Bs
                </strong>
              </div>
            </div>

            {/* Separación grande abajo */}
            <div
              style={{
                marginTop: 24,
                paddingTop: 16,
                borderTop: "1px solid rgba(255,255,255,0.15)",
                fontSize: 14,
                lineHeight: 1.6,
              }}
            >
              <div>BCV USD: {usdBcv?.toFixed(2)} Bs</div>
              <div>BCV EUR: {eurBcv?.toFixed(2)} Bs</div>
              <div>P2P: {usdt?.toFixed(2)} Bs</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
