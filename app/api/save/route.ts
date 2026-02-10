export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getDB } from "@/app/lib/db";

export async function POST(req: Request) {
  try {
    const { currency, bcv, binance } = await req.json();

    if (!currency || typeof bcv !== "number" || typeof binance !== "number") {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const brecha = ((binance - bcv) / bcv) * 100;

    db.prepare(`
      INSERT INTO rates (currency, bcv, binance, brecha, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      currency,
      bcv,
      binance,
      brecha,
      new Date().toISOString()
    );

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("SAVE ERROR:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
