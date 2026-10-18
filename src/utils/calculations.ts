export function calculateGrossRentalYield(
  medianWeeklyRent: number | null,
  medianSalePrice: number | null
): number | null {
  if (
    medianWeeklyRent === null ||
    medianSalePrice === null ||
    medianWeeklyRent < 0 ||
    medianSalePrice <= 0
  ) {
    return null;
  }

  return (medianWeeklyRent * 52 * 100) / medianSalePrice;
}

export function calculateAnnualGrowth(
  currentValue: number | null,
  previousValue: number | null
): number | null {
  if (
    currentValue === null ||
    previousValue === null ||
    previousValue <= 0
  ) {
    return null;
  }

  return ((currentValue - previousValue) / previousValue) * 100;
}