export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getDB } from "@/app/lib/db";

export async function GET(req: Request) {
  const db = getDB();

  const { searchParams } = new URL(req.url);

  const currency = searchParams.get("currency") ?? "USD";
  const range = Number(searchParams.get("range") ?? 60);
  const bucket = Number(searchParams.get("bucket") ?? 1);

  const from = new Date(Date.now() - range * 60_000).toISOString();

  try {
    // 🔹 Si el bucket es 1 → NO agrupar (gráfica limpia)
    if (bucket === 1) {
      const rows = db.prepare(`
        SELECT
          CAST(strftime('%s', created_at) AS INTEGER) * 1000 AS t,
          bcv,
          binance,
          brecha
        FROM rates
        WHERE currency = ?
          AND created_at >= ?
        ORDER BY created_at ASC
      `).all(currency, from);

      return NextResponse.json(rows);
    }

    // 🔹 Si el bucket > 1 → agrupar
    const rows = db.prepare(`
      SELECT
        CAST(strftime('%s', created_at) AS INTEGER) * 1000 AS t,
        AVG(bcv) AS bcv,
        AVG(binance) AS binance,
        AVG(brecha) AS brecha
      FROM rates
      WHERE currency = ?
        AND created_at >= ?
      GROUP BY CAST(strftime('%s', created_at) AS INTEGER) / (? * 60)
      ORDER BY t ASC
    `).all(currency, from, bucket);

    return NextResponse.json(rows);
  } catch (e) {
    console.error("HISTORY ERROR:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
