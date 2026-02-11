export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getDB } from "@/app/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const currency = searchParams.get("currency") ?? "USD";
  const period = searchParams.get("period") ?? "day"; // day | week

  const minutes = period === "week" ? 10080 : 1440;

  const from = new Date(Date.now() - minutes * 60_000).toISOString();

  try {
    const db = getDB();

    const row = db.prepare(`
      SELECT
        AVG(bcv)      AS avg_bcv,
        AVG(binance) AS avg_binance,
        AVG(brecha)  AS avg_brecha,
        MAX(brecha)  AS max_brecha,
        MIN(brecha)  AS min_brecha
      FROM rates
      WHERE currency = ?
        AND created_at >= ?
    `).get(currency, from);

    return NextResponse.json(row ?? {});
  } catch (e) {
    return NextResponse.json(
      { error: String(e) },
      { status: 500 }
    );
  }
}
