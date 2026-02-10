let started = false;

export function startCron() {
  if (started) return;
  started = true;

  console.log("⏱️ Cron iniciado (cada 60s)");

  setInterval(async () => {
    try {
      const [bcvRes, binanceRes] = await Promise.all([
        fetch("http://localhost:3000/api/bcv"),
        fetch("http://localhost:3000/api/binance"),
      ]);

      const bcv = (await bcvRes.json()).usd;
      const binance = (await binanceRes.json()).usdt;

      await fetch("http://localhost:3000/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bcv, binance }),
      });

      console.log("✅ Registro guardado");
    } catch (e) {
      console.error("❌ Error en cron", e);
    }
  }, 60_000);
}
