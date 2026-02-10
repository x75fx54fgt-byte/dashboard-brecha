type CardProps = {
  title: string;
  value: string;
  subtitle?: string;
};

export default function Card({ title, value, subtitle }: CardProps) {
  return (
    <div
      style={{
        border: "1px solid #333",
        borderRadius: 12,
        padding: 16,
        background: "#111",
      }}
    >
      <h4 style={{ margin: 0, marginBottom: 8 }}>{title}</h4>

      <div style={{ fontSize: 24, fontWeight: "bold" }}>
        {value}
      </div>

      {subtitle && (
        <div style={{ marginTop: 6, color: "#777", fontSize: 13 }}>
          {subtitle}
        </div>
      )}
    </div>
  );
}
