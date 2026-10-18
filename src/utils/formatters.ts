export function formatCurrency(value: number | null, compact = false): string {
  if (value === null || !Number.isFinite(value)) return 'Not available';

  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    maximumFractionDigits: 0,
    notation: compact ? 'compact' : 'standard',
  }).format(value);
}

export function formatWeeklyRent(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return 'Not available';
  return `${formatCurrency(value)}/week`;
}

export function formatPercentage(value: number | null, digits = 1): string {
  if (value === null || !Number.isFinite(value)) return 'Not available';
  return `${value.toFixed(digits)}%`;
}

export function formatNumber(value: number | null, digits = 0): string {
  if (value === null || !Number.isFinite(value)) return 'Not available';

  return new Intl.NumberFormat('en-AU', {
    maximumFractionDigits: digits,
  }).format(value);
}