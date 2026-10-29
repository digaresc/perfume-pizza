// Prices are stored in whole dollars; the CRM shows them with cents for extra luxury.
const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function formatPrice(dollars: number): string {
  return usd.format(dollars);
}
