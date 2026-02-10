"use client";

import { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
  Filler
);

type Row = {
  t: number;
  bcv: number;
  binance: number;
  brecha: number;
};

export default function BrechaTripleChart({ data }: { data: Row[] }) {
  const chartRef = useRef<any>(null);

  // ✅ cargar zoom SOLO en cliente
  useEffect(() => {
    if (typeof window === "undefined") return;

    import("chartjs-plugin-zoom").then((zoomPlugin) => {
      ChartJS.register(zoomPlugin.default);
    });
  }, []);

  if (!Array.isArray(data) || data.length < 2) {
    return <p style={{ color: "#777" }}>Aún no hay suficientes datos…</p>;
  }

  // limpiar + ordenar
  const clean = data
    .filter(
      (d) =>
        isFinite(d.t) &&
        isFinite(d.bcv) &&
        isFinite(d.binance) &&
        isFinite(d.brecha)
    )
    .sort((a, b) => a.t - b.t);

  const chartData = {
    datasets: [
      {
        label: "BCV (Bs)",
        data: clean.map((d) => ({ x: d.t, y: d.bcv })),
        borderColor: "#3b82f6",
        tension: 0.25,
        pointRadius: 0,
        yAxisID: "y",
      },
      {
        label: "USDT P2P (Bs)",
        data: clean.map((d) => ({ x: d.t, y: d.binance })),
        borderColor: "#f59e0b",
        tension: 0.25,
        pointRadius: 0,
        yAxisID: "y",
      },
      {
        label: "Brecha (%)",
        data: clean.map((d) => ({ x: d.t, y: d.brecha })),
        borderColor: "#22c55e",
        backgroundColor: "rgba(34,197,94,0.2)",
        fill: true,
        tension: 0.25,
        pointRadius: 0,
        yAxisID: "y1",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    scales: {
      x: {
        type: "time" as const,
        time: { tooltipFormat: "HH:mm:ss" },
        title: { display: true, text: "Tiempo" },
      },
      y: {
        position: "left" as const,
        title: { display: true, text: "Bs" },
      },
      y1: {
        position: "right" as const,
        grid: { drawOnChartArea: false },
        title: { display: true, text: "Brecha %" },
      },
    },
    plugins: {
      legend: { display: true },
      zoom: {
        pan: {
          enabled: true,
          mode: "x",
          modifierKey: "ctrl",
        },
        zoom: {
          wheel: { enabled: true },
          pinch: { enabled: true },
          mode: "x",
        },
      },
    },
  };

  return (
    <div style={{ height: 420 }}>
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  );
}
