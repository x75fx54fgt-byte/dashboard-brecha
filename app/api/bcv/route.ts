import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    // API base (USD como referencia)
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      cache: "no-store",
    });

    const json = await res.json();

    if (!json?.rates?.VES || !json?.rates?.EUR) {
      throw new Error("Datos incompletos");
    }

    // USD → Bs (VES)
    const usd = json.rates.VES;

    // EUR → Bs (calculado)
    // EUR → USD = 1 / rate.EUR
    // EUR → Bs = (USD → Bs) / (USD → EUR)
    const eur = usd / json.rates.EUR;

    return NextResponse.json({
      usd,
      eur,
      source: "open.er-api.com (calc EUR)",
    });
  } catch (e) {
    console.error("BCV ERROR:", e);
    return NextResponse.json(
      { error: "No se pudo obtener tasas" },
      { status: 500 }
    );
  }
}
