export function totals(so) {
  const ordered = so.quantity;
  const shipped = so.shippingQty?.reduce((n, r) => n + r.qty, 0) || 0;
  const delivered = so.deliveringQty?.reduce((n, r) => n + r.qty, 0) || 0;
  const invoiced = so.invoicingQty?.reduce((n, r) => n + r.qty, 0) || 0;

  return {
    ordered,
    shipped,
    delivered,
    invoiced,
    remainToShip: so.quantity - shipped,
    remainToDeliver: shipped - delivered,
    remainToInvoice: delivered - invoiced,
  };
}
