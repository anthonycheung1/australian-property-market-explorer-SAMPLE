export type PropertyType = 'All' | 'House' | 'Unit';

export interface SuburbSuggestion {
  id: string;
  name: string;
  displayName: string;
  state: string;
  postcode: string;
  label?: string;
}

export interface HistoricalPoint {
  date: string;
  price: number | null;
  rent: number | null;
  housePrice?: number | null;
  unitPrice?: number | null;
  houseRent?: number | null;
  unitRent?: number | null;
}

export interface PropertyTypeMetrics {
  medianSalePrice: number | null;
  medianWeeklyRent: number | null;
  grossRentalYield: number | null;
  annualPriceGrowth: number | null;
  priceGrowth5y: number | null;
  salesCount: number | null;
  daysOnMarket: number | null;
}

export interface SuburbMarketData {
  suburb: string;
  state: string;
  postcode: string;
  medianSalePrice: number | null;
  medianWeeklyRent: number | null;
  grossRentalYield: number | null;
  annualPriceGrowth: number | null;
  priceGrowth5y: number | null;
  salesCount: number | null;
  daysOnMarket: number | null;
  byType: {
    House: PropertyTypeMetrics;
    Unit: PropertyTypeMetrics;
  };
  history: HistoricalPoint[];
  dataPeriodLabel: string | null;
}