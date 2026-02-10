"use client";

import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  Tooltip,
  Legend,
  TimeScale,
  ChartData,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend
);

type Point = { x: number; y: number };

export default function BrechaChart({ points }: { points: Point[] }) {
  const chartData: ChartData<"line", Point[]> = {
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
  };

  return (
    <div style={{ height: 360 }}>
      <Line data={chartData} options={options} />
    </div>
  );
}
