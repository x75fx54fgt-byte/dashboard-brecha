import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";

function avg(arr: number[]) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function std(arr: number[]) {
  const m = avg(arr);
  return Math.sqrt(avg(arr.map(x => (x - m) ** 2)));
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const currency = searchParams.get("currency") ?? "USD";

  // Últimas 24 horas
  const from = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const rows = db.prepare(`
    SELECT brecha
    FROM rates
    WHERE currency = ?
      AND created_at >= ?
    ORDER BY created_at ASC
  `).all(currency, from) as { brecha: number }[];

  if (rows.length < 10) {
    return NextResponse.json({ error: "Datos insuficientes" });
  }

  const values = rows.map(r => r.brecha);
  const last = values.at(-1)!;
  const mean = avg(values);
  const volatility = std(values);

  // Tendencia simple
  const trend = last - values[values.length - 5];

  // Proyección experta
  const direction =
    trend > volatility * 0.2 ? "expansión" :
    trend < -volatility * 0.2 ? "contracción" :
    "lateral";

  const expectedMin = last - volatility * 0.8;
  const expectedMax = last + volatility * 0.8;

  return NextResponse.json({
    currency,
    direction,
    last: Number(last.toFixed(2)),
    expected_24h: {
      min: Number(expectedMin.toFixed(2)),
      max: Number(expectedMax.toFixed(2)),
    },
    volatility: Number(volatility.toFixed(2)),
  });
}
