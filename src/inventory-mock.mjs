const rows = [
  { sku: "SKU-001", name: "Wireless Mouse", stock: 42 },
  { sku: "SKU-002", name: "Mechanical Keyboard", stock: 7 },
  { sku: "SKU-003", name: "USB-C Cable", stock: 120 },
];

export function getProductBySku(sku) {
  const key = String(sku).trim().toUpperCase();
  const row = rows.find((r) => r.sku.toUpperCase() === key);
  if (!row) return JSON.stringify({ found: false, sku: String(sku).trim() });
  return JSON.stringify({ found: true, ...row });
}