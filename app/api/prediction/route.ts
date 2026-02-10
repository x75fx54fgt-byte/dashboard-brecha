export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const currency = searchParams.get("currency") ?? "USD";

  try {
    // ✅ Debug opcional: te dice exactamente qué DB está usando este endpoint
    const dbInfo = db.prepare("PRAGMA database_list;").all();

    // ✅ Traer brecha últimas 24h desde LA MISMA DB
    const rows = db
      .prepare(`
        SELECT brecha
        FROM rates
        WHERE currency = ?
          AND created_at >= datetime('now', '-1 day')
        ORDER BY created_at ASC
      `)
      .all(currency) as { brecha: number }[];

    if (!rows || rows.length < 10) {
      return NextResponse.json({
        direction: "neutral",
        expected_range: { min: 0, max: 0 },
        breakout_probability: { up: 0, down: 0 },
        risk_level: "bajo",
        note: "insufficient data",
        debug_db: dbInfo, // 👈 esto te ayudará a confirmar la ruta real
        debug_rows: rows?.length ?? 0,
      });
    }

    const values = rows.map((r) => Number(r.brecha)).filter((n) => Number.isFinite(n));
    const min = Math.min(...values);
    const max = Math.max(...values);

    const first = values[0];
    const last = values[values.length - 1];

    let direction: "alza" | "baja" | "lateral" = "lateral";
    if (last > first * 1.02) direction = "alza";
    else if (last < first * 0.98) direction = "baja";

    const spread = (max - min) * 0.2;

    return NextResponse.json({
      direction,
      expected_range: {
        min: Number((min - spread).toFixed(2)),
        max: Number((max + spread).toFixed(2)),
      },
      breakout_probability: { up: 0, down: 0 },
      risk_level: "bajo",
      note: "ok",
      debug_db: dbInfo,
      debug_rows: rows.length,
    });
  } catch (e) {
    console.error("PREDICTION ERROR:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
