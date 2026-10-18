
import type {
  HistoricalPoint,
  PropertyType,
  PropertyTypeMetrics,
  SuburbMarketData,
  SuburbSuggestion,
} from '../types/property';

const API_BASE_URL =
  'https://property-yield-proxy.tonycheung75.workers.dev';

type UnknownRecord = Record<string, unknown>;

interface WorkerResponse {
  data?: UnknownRecord;
  suburb?: string;
  warnings?: string[];
  error?: string;
}

const DEMO_SUBURBS: SuburbSuggestion[] = [
  { id: 'bondi-nsw', name: 'Bondi', displayName: 'Bondi, NSW', state: 'NSW', postcode: '' },
  { id: 'belmont-north-nsw', name: 'Belmont North', displayName: 'Belmont North, NSW', state: 'NSW', postcode: '' },
  { id: 'st-kilda-vic', name: 'St Kilda', displayName: 'St Kilda, VIC', state: 'VIC', postcode: '' },
  { id: 'fortitude-valley-qld', name: 'Fortitude Valley', displayName: 'Fortitude Valley, QLD', state: 'QLD', postcode: '' },
  { id: 'subiaco-wa', name: 'Subiaco', displayName: 'Subiaco, WA', state: 'WA', postcode: '' },
  { id: 'unley-sa', name: 'Unley', displayName: 'Unley, SA', state: 'SA', postcode: '' },
  { id: 'sandy-bay-tas', name: 'Sandy Bay', displayName: 'Sandy Bay, TAS', state: 'TAS', postcode: '' },
  { id: 'kambah-act', name: 'Kambah', displayName: 'Kambah, ACT', state: 'ACT', postcode: '' },
  { id: 'nightcliff-nt', name: 'Nightcliff', displayName: 'Nightcliff, NT', state: 'NT', postcode: '' },
];

export const EMPTY_METRICS: PropertyTypeMetrics = {
  medianSalePrice: null,
  medianWeeklyRent: null,
  grossRentalYield: null,
  annualPriceGrowth: null,
  priceGrowth5y: null,
  salesCount: null,
  daysOnMarket: null,
};

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getValue(value: unknown, ...keys: string[]): unknown {
  let current: unknown = value;

  for (const key of keys) {
    if (!isRecord(current)) {
      return undefined;
    }

    current = current[key];
  }

  return current;
}

function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  return null;
}

function firstNumber(...values: unknown[]): number | null {
  for (const value of values) {
    const number = toNumber(value);

    if (number !== null) {
      return number;
    }

    if (isRecord(value)) {
      const nested = firstNumber(
        value.value,
        value.median,
        value.amount,
        value.price,
        value.rent,
        value.yield,
        value.yield_pct,
        value.percentage,
        value.count,
        value.days,
      );

      if (nested !== null) {
        return nested;
      }
    }
  }

  return null;
}

function getTypeValue(
  payload: unknown,
  type: 'house' | 'unit',
): number | null {
  return firstNumber(getValue(payload, type));
}

function getGrowth(
  payload: unknown,
  type: 'house' | 'unit',
  period: '1yr' | '5yr',
): number | null {
  const value = toNumber(getValue(payload, type, period));

  // Microburbs returns growth as a decimal fraction:
  // 0.0769 becomes 7.69%.
  return value === null ? null : value * 100;
}

function getSeries(
  payload: unknown,
  type: 'house' | 'unit',
): Array<{ date: string; value: number }> {
  const typeData = getValue(payload, type);

  // Some endpoints return an array directly; others return
  // an object containing { value, series }.
  const series = Array.isArray(typeData)
    ? typeData
    : getValue(typeData, 'series');

  if (!Array.isArray(series)) {
    return [];
  }

  return series.flatMap((item) => {
    if (!isRecord(item)) {
      return [];
    }

    const date = item.date ?? item.period ?? item.month;
    const value = firstNumber(
      item.value,
      item.median,
      item.amount,
      item.price,
      item.rent,
    );

    if (typeof date !== 'string' || value === null) {
      return [];
    }

    return [{ date, value }];
  });
}

function combineHistory(
  saleSeries: unknown,
  rentSeries: unknown,
): HistoricalPoint[] {
  const housePrices = getSeries(saleSeries, 'house');
  const unitPrices = getSeries(saleSeries, 'unit');
  const houseRents = getSeries(rentSeries, 'house');
  const unitRents = getSeries(rentSeries, 'unit');

  const allPoints = [
    ...housePrices,
    ...unitPrices,
    ...houseRents,
    ...unitRents,
  ];

  const dates = [...new Set(allPoints.map((point) => point.date))];

  const toMap = (
    points: Array<{ date: string; value: number }>,
  ) => new Map(points.map((point) => [point.date, point.value]));

  const housePriceMap = toMap(housePrices);
  const unitPriceMap = toMap(unitPrices);
  const houseRentMap = toMap(houseRents);
  const unitRentMap = toMap(unitRents);

  return dates.sort().map((date) => {
    const housePrice = housePriceMap.get(date) ?? null;
    const unitPrice = unitPriceMap.get(date) ?? null;
    const houseRent = houseRentMap.get(date) ?? null;
    const unitRent = unitRentMap.get(date) ?? null;

    const prices = [housePrice, unitPrice].filter(
      (value): value is number => value !== null,
    );

    const rents = [houseRent, unitRent].filter(
      (value): value is number => value !== null,
    );

    return {
      date,
      price: prices.length
        ? prices.reduce((sum, value) => sum + value, 0) / prices.length
        : null,
      rent: rents.length
        ? rents.reduce((sum, value) => sum + value, 0) / rents.length
        : null,
      housePrice,
      unitPrice,
      houseRent,
      unitRent,
    };
  });
}

function average(
  first: number | null,
  second: number | null,
): number | null {
  if (first !== null && second !== null) {
    return (first + second) / 2;
  }

  return first ?? second;
}

function getTypeMetrics(
  raw: UnknownRecord,
  type: 'house' | 'unit',
): PropertyTypeMetrics {
  const volume = getValue(raw.transaction_volume, type);

  const yieldValue = getTypeValue(raw.yield_pct, type);

  return {
    medianSalePrice: getTypeValue(raw.median_sale_price, type),
    medianWeeklyRent: getTypeValue(raw.median_rent, type),

    // Convert decimal yield to a percentage.
    grossRentalYield:
      yieldValue === null ? null : yieldValue * 100,

    annualPriceGrowth: getGrowth(raw.price_growth, type, '1yr'),
    priceGrowth5y: getGrowth(raw.price_growth, type, '5yr'),

    // transaction_volume.house/unit is an object containing
    // a current value and a historical series.
    salesCount: firstNumber(
      getValue(volume, 'value'),
      getValue(volume, 'count'),
      getValue(volume, 'sold_count_30d'),
    ),

    daysOnMarket: getTypeValue(raw.days_on_market, type),
  };
}

function getAsOf(raw: UnknownRecord): string | null {
  const payloads = [
    raw.median_sale_price,
    raw.median_rent,
    raw.price_growth,
    raw.yield_pct,
    raw.days_on_market,
  ];

  for (const payload of payloads) {
    if (!isRecord(payload)) {
      continue;
    }

    const date = payload.as_of ?? payload.asOf ?? payload.date;

    if (typeof date === 'string' && date) {
      return date;
    }
  }

  return null;
}

function getSuburbParts(
  name: string,
  state?: string,
  postcode?: string,
): { suburb: string; state: string; postcode: string } {
  let suburb = name.trim();
  let resolvedState = state?.trim() ?? '';
  let resolvedPostcode = postcode?.trim() ?? '';

  const fullMatch = suburb.match(
    /^(.+?),\s*([A-Z]{2,3})(?:\s+(\d{4}))?$/i,
  );

  if (fullMatch) {
    suburb = fullMatch[1].trim();
    resolvedState ||= fullMatch[2].toUpperCase();
    resolvedPostcode ||= fullMatch[3] ?? '';
  }

  return {
    suburb,
    state: resolvedState,
    postcode: resolvedPostcode,
  };
}

/**
 * Search the local demonstration suburb list.
 *
 * Existing usage:
 * searchSuburbs(query, controller.signal)
 */
export async function searchSuburbs(
  query: string,
  signal?: AbortSignal,
): Promise<SuburbSuggestion[]> {
  if (signal?.aborted) {
    throw new DOMException('Search cancelled.', 'AbortError');
  }

  const normalisedQuery = query.trim().toLowerCase();

  if (!normalisedQuery) {
    return DEMO_SUBURBS;
  }

  return DEMO_SUBURBS.filter((suburb) =>
    `${suburb.name} ${suburb.displayName} ${suburb.state} ${suburb.postcode}`
      .toLowerCase()
      .includes(normalisedQuery),
  );
}

/**
 * Fetch suburb market data from the Cloudflare Worker.
 *
 * Supports:
 * getSuburbMarketData('Belmont North, NSW')
 * getSuburbMarketData(name, state, postcode, propertyType)
 */
export async function getSuburbMarketData(
  name: string,
  state?: string,
  postcode?: string,
  propertyType: PropertyType = 'All',
): Promise<SuburbMarketData> {
  const parts = getSuburbParts(name, state, postcode);

  if (!parts.suburb) {
    throw new Error('Please enter a suburb name.');
  }

  const url = new URL(API_BASE_URL);
  url.searchParams.set('suburb', parts.suburb);

  const response = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
    },
  });

  let result: WorkerResponse;

  try {
    result = (await response.json()) as WorkerResponse;
  } catch {
    throw new Error(
      'The market data service returned an invalid response.',
    );
  }

  if (!response.ok) {
    throw new Error(
      result.error ??
        `Market data request failed (${response.status}).`,
    );
  }

  if (!result.data || !isRecord(result.data)) {
    throw new Error(
      'The API did not return market data for this suburb.',
    );
  }

  const raw = result.data;

  const house = getTypeMetrics(raw, 'house');
  const unit = getTypeMetrics(raw, 'unit');

  const allMetrics: PropertyTypeMetrics = {
    medianSalePrice: average(
      house.medianSalePrice,
      unit.medianSalePrice,
    ),
    medianWeeklyRent: average(
      house.medianWeeklyRent,
      unit.medianWeeklyRent,
    ),
    grossRentalYield: average(
      house.grossRentalYield,
      unit.grossRentalYield,
    ),
    annualPriceGrowth: average(
      house.annualPriceGrowth,
      unit.annualPriceGrowth,
    ),
    priceGrowth5y: average(
      house.priceGrowth5y,
      unit.priceGrowth5y,
    ),
    salesCount:
      house.salesCount !== null && unit.salesCount !== null
        ? house.salesCount + unit.salesCount
        : house.salesCount ?? unit.salesCount,
    daysOnMarket: average(
      house.daysOnMarket,
      unit.daysOnMarket,
    ),
  };

  const selectedMetrics =
    propertyType === 'House'
      ? house
      : propertyType === 'Unit'
        ? unit
        : allMetrics;

  const history = combineHistory(
    raw.median_sale_price_series,
    raw.median_rent_series,
  );

  return {
    ...parts,
    suburb: parts.suburb || result.suburb || name,
    ...selectedMetrics,
    byType: {
      House: house,
      Unit: unit,
    },
    history,
    dataPeriodLabel: getAsOf(raw),
  };
}
