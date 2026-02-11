
export const runtime = "nodejs";
export const preferredRegion = "auto";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { NextResponse } from "next/server";
import { getDB } from "@/app/lib/db";

/**
 * ⛔ GET dummy
 * Vercel lo ejecuta durante build
 * NO debe tocar DB
 */
export async function GET() {
  return NextResponse.json(
    { ok: false, message: "Method not allowed" },
    { status: 405 }
  );
}

/**
 * ✅ POST real
 */
export async function POST(req: Request) {
  try {
    const db = getDB();

    const body = await req.json();
    const { currency, bcv, binance } = body ?? {};

    if (!currency || typeof bcv !== "number" || typeof binance !== "number") {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const brecha = ((binance - bcv) / bcv) * 100;

    db.prepare(`
      INSERT INTO rates (currency, bcv, binance, brecha, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(currency, bcv, binance, brecha, new Date().toISOString());

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("SAVE ERROR:", e);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}
