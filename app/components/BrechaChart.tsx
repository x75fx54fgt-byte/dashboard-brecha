"use client";

import { useMemo } from "react";
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

type InputPoint =
  | { t: number; y: number }
  | { t: number; v: number };

export default function BrechaChart({ data }: { data: InputPoint[] }) {
  const points = useMemo(() => {
    return data
      .map((p: any) => ({
        x: p.t,
        y: typeof p.y === "number" ? p.y : p.v,
      }))
      .filter(
        (p) => typeof p.x === "number" && typeof p.y === "number"
      );
  }, [data]);

  const yValues = points.map((p) => p.y);

  const chartData = {
    datasets: [
      {
        label: "Brecha %",
        data: points,
        borderColor: "#22c55e",
        backgroundColor: "transparent",
        fill: true,
        tension: 0.25,
        pointRadius: 5,
        pointHoverRadius: 7,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: "time" as const,
        time: {
          unit: "minute",
          tooltipFormat: "HH:mm:ss",
        },
        title: {
          display: true,
          text: "Tiempo",
        },
      },
      y: {
        title: {
          display: true,
          text: "Brecha (%)",
        },
        beginAtZero: false,
        suggestedMin: Math.min(...yValues) - 1,
        suggestedMax: Math.max(...yValues) + 1,
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (ctx: any) =>
            `Brecha: ${ctx.parsed.y.toFixed(2)} %`,
        },
      },
      legend: {
        display: true,
      },
    },
  };

  return (
    <div style={{ height: 360 }}>
      <Line data={chartData} options={options} />
    </div>
  );
}
