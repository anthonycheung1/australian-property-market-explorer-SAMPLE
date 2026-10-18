export type PropertyType = 'House' | 'Unit' | 'All';

export interface SuburbSuggestion {
  id: string;
  name: string;
  state: string;
  postcode: string;
  displayName: string;
}

export interface MarketMetric {
  period?: string;
  value: number | null;
}

export interface HistoricalPoint {
  date: string;
  price: number | null;
  rent: number | null;
}

export interface SuburbMarketData {
  suburb: string;
  state: string;
  postcode: string;
  propertyType: PropertyType;
  medianSalePrice: number | null;
  medianWeeklyRent: number | null;
  salesCount: number | null;
  daysOnMarket: number | null;
  annualPriceGrowth: number | null;
  grossRentalYield: number | null;
  history: HistoricalPoint[];
  dataPeriodLabel?: string;
}

export interface SuburbRouteParams {
  state: string;
  suburb: string;
  postcode: string;
}