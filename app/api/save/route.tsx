await db.run(
  `
  INSERT INTO rates (currency, bcv, binance, brecha, created_at)
  VALUES (?, ?, ?, ?, datetime('now'))
  `,
  currency,
  bcv,
  binance,
  brecha
);
