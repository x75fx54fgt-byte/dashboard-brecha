export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";

export async function GET() {
  try {
    const bcv = 36.5;
    const binance = 38.2;

    const brecha = ((binance - bcv) / bcv) * 100;

    db.prepare(
      "INSERT INTO rates (bcv, binance, brecha) VALUES (?, ?, ?)"
    ).run(bcv, binance, brecha);

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: String(e) },
      { status: 500 }
    );
  }
}
