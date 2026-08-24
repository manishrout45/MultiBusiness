const buildInvoiceHtml = (order, items = [], business = {}) => {
  const rows = items
    .map(
      (item) =>
        `<tr><td>${item.product_name}</td><td>${item.quantity}</td><td>₹${item.unit_price}</td><td>₹${item.total_price}</td></tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Invoice ${order.order_number}</title>
  <style>
    body { font-family: Arial, sans-serif; color: #222; margin: 2rem; }
    h1 { color: #0d6e4f; }
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background: #f5f5f5; }
    .meta { margin: 1rem 0; color: #555; }
  </style>
</head>
<body>
  <h1>Invoice</h1>
  <div class="meta">
    <p><strong>Order:</strong> ${order.order_number}</p>
    <p><strong>Date:</strong> ${order.created_at || new Date().toISOString()}</p>
    <p><strong>Business:</strong> ${business.business_name || ''}</p>
    <p><strong>Ship to:</strong> ${order.shipping_address}</p>
    <p><strong>Phone:</strong> ${order.phone}</p>
    <p><strong>Payment:</strong> ${order.payment_method} (${order.payment_status})</p>
  </div>
  <table>
    <thead><tr><th>Item</th><th>Qty</th><th>Unit</th><th>Total</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <p style="margin-top:1.5rem"><strong>Grand Total: ₹${order.total_amount}</strong></p>
  <p>Platform commission: ₹${order.commission_amount || 0}</p>
</body>
</html>`;
};

const toCsv = (rows) => {
  if (!rows?.length) return '';
  const headers = Object.keys(rows[0]);
  const escape = (v) => {
    const s = v == null ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.join(','), ...rows.map((r) => headers.map((h) => escape(r[h])).join(','))].join('\n');
};

module.exports = { buildInvoiceHtml, toCsv };
