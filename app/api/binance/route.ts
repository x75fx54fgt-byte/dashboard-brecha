import { NextResponse } from "next/server";

type BinanceAd = {
  adv: { price: string };
};

export async function GET() {
  // Binance P2P endpoint (public)
  const url = "https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search";

  // Queremos VES por 1 USDT
  // tradeType:
  // - "BUY"  = gente que compra USDT (tú vendes USDT)
  // - "SELL" = gente que vende USDT (tú compras USDT)
  //
  // Para "promedio de mercado", normalmente se usa SELL (precio al que consigues USDT).
  const payload = {
    page: 1,
    rows: 10,              // tomamos 10 anuncios para promediar
    payTypes: [],
    publisherType: null,
    asset: "USDT",
    fiat: "VES",
    tradeType: "SELL",
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!res.ok) {
    return NextResponse.json(
      { source: "BINANCE_P2P", error: `HTTP ${res.status}` },
      { status: 500 }
    );
  }

  const json = await res.json();

  const ads: BinanceAd[] = json?.data ?? [];

  const prices = ads
    .map((a) => Number(a.adv.price))
    .filter((n) => Number.isFinite(n));

  if (prices.length === 0) {
    return NextResponse.json(
      { source: "BINANCE_P2P", error: "No prices found" },
      { status: 500 }
    );
  }

  const avg = prices.reduce((a, b) => a + b, 0) / prices.length;

  return NextResponse.json({
    source: "BINANCE_P2P",
    usdt: avg,                 // VES por 1 USDT (promedio)
    sampleCount: prices.length,
    date: new Date().toISOString(),
  });
}
