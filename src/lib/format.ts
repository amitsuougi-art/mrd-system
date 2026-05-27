export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number, decimals = 0): string {
  return new Intl.NumberFormat("ja-JP", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

export function formatRate(rate: number): string {
  return `${rate.toFixed(6)}%`;
}

export function formatDate(isoDate: string): string {
  if (!isoDate) return "";
  return new Date(isoDate).toLocaleDateString("ja-JP");
}

export function formatDateTime(isoDate: string): string {
  if (!isoDate) return "";
  return new Date(isoDate).toLocaleString("ja-JP");
}
