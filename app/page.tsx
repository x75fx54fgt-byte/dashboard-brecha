export default function Home() {
  return (
    <main style={{ padding: 24, fontFamily: "Arial", maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 4 }}>Dashboard Brecha ✅</h1>
      <p style={{ color: "#777", marginTop: 0 }}>
        Brecha estimada (demo). Próximo paso: conectar tasas reales.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginTop: 24,
        }}
      >
        <Card title="USD → Bs (Promedio)" value="—" subtitle="Fuente: pendiente" />
        <Card title="USDT P2P (Promedio)" value="—" subtitle="Fuente: pendiente" />
        <Card title="Brecha estimada" value="—" subtitle="Cálculo: pendiente" />
        <Card title="Última actualización" value="—" subtitle="Auto: pendiente" />
      </div>

      <div style={{ marginTop: 24, padding: 16, border: "1px solid #eee", borderRadius: 12 }}>
        <h2 style={{ marginTop: 0 }}>Siguiente paso</h2>
        <ol style={{ margin: 0, paddingLeft: 18 }}>
          <li>Conectar una fuente de tasa USD/Bs</li>
          <li>Conectar tasa USDT P2P</li>
          <li>Calcular brecha y graficar</li>
        </ol>
      </div>
    </main>
  );
}

function Card({ title, value, subtitle }: { title: string; value: string; subtitle: string }) {
  return (
    <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 16 }}>
      <div style={{ fontSize: 13, color: "#666" }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 700, marginTop: 8 }}>{value}</div>
      <div style={{ fontSize: 12, color: "#888", marginTop: 6 }}>{subtitle}</div>
    </div>
  );
}