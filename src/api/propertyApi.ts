
import type {
  HistoricalPoint,
  PropertyType,
  SuburbMarketData,
  SuburbSuggestion,
} from '../types/property';

const API_BASE_URL =
  'https://property-yield-proxy.tonycheung75.workers.dev/';

// Microburbs demo-supported suburbs.
const SUPPORTED_SUBURBS = [
  { name: 'Bondi', state: 'NSW' },
  { name: 'Belmont North', state: 'NSW' },
  { name: 'St Kilda', state: 'VIC' },
  { name: 'Fortitude Valley', state: 'QLD' },
  { name: 'Subiaco', state: 'WA' },
  { name: 'Unley', state: 'SA' },
  { name: 'Sandy Bay', state: 'TAS' },
  { name: 'Kambah', state: 'ACT' },
  { name: 'Nightcliff', state: 'NT' },
];

interface MarketPoint {
  date: string;
  value: number;
}

interface MarketMetric {
  area_name: string;
  area_level: string;
  house: number | null;
  unit: number | null;
  as_of?: string;
}

interface MarketSeries {
  area_name: string;
  area_level: string;
  house?: MarketPoint[] | null;
  unit?: MarketPoint[] | null;
}

interface MarketAllResponse {
  data: {
    median_sale_price?: MarketMetric;
    median_sale_price_series?: MarketSeries;
  } | null;
}

/**
 * Search the locally defined list of supported demo suburbs.
 */
export async function searchSuburbs(
  query: string,
  signal?: AbortSignal
): Promise<SuburbSuggestion[]> {
  signal?.throwIfAborted();

  const trimmedQuery = query.trim();

  if (trimmedQuery.length < 2) {
    return [];
  }

  const normalisedQuery = trimmedQuery.toLowerCase();

  return SUPPORTED_SUBURBS
    .filter((suburb) =>
      `${suburb.name} ${suburb.state}`
        .toLowerCase()
        .includes(normalisedQuery)
    )
    .map((suburb) => ({
      id: `${suburb.name}-${suburb.state}`,
      name: suburb.name,
      state: suburb.state,
      postcode: '',
      displayName: `${suburb.name}, ${suburb.state}`,
    }));
}

/**
 * Fetch market data from the Cloudflare Worker.
 */
async function fetchMarketData(
  suburb: string,
  signal?: AbortSignal
): Promise<NonNullable<MarketAllResponse['data']>> {
  const url = new URL(API_BASE_URL);
  url.searchParams.set('suburb', suburb);

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
    signal,
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error(
        'The property API rejected the request. Check API access and credentials.'
      );
    }

    if (response.status === 429) {
      throw new Error(
        'The API rate limit has been reached. Please wait and try again.'
      );
    }

    throw new Error(
      `Property API request failed (${response.status}).`
    );
  }

  const result: MarketAllResponse = await response.json();

  if (!result.data?.median_sale_price) {
    throw new Error(
      'The API response did not contain median sale price data.'
    );
  }

  return result.data;
}

/**
 * Convert Microburbs market data into the existing
 * SuburbMarketData format.
 */
export async function getSuburbMarketData(
  suburb: string,
  state: string,
  postcode: string,
  propertyType: PropertyType,
  signal?: AbortSignal
): Promise<SuburbMarketData> {
  const supportedSuburb = SUPPORTED_SUBURBS.find(
    (item) =>
      item.name.toLowerCase() === suburb.trim().toLowerCase() &&
      item.state.toLowerCase() === state.trim().toLowerCase()
  );

  if (!supportedSuburb) {
    throw new Error(
      'This demo supports only the listed Microburbs suburbs.'
    );
  }

  const raw = await fetchMarketData(
    supportedSuburb.name,
    signal
  );

  const salePrice = raw.median_sale_price;

  if (!salePrice) {
    throw new Error(
      'The API response did not contain median sale price data.'
    );
  }

  const series = raw.median_sale_price_series;

  if (
    salePrice.area_name.toLowerCase() !==
    supportedSuburb.name.toLowerCase()
  ) {
    throw new Error(
      'The API returned data for an unexpected suburb.'
    );
  }

  const selectedType = propertyType.toLowerCase();

  const medianSalePrice =
    selectedType === 'house'
      ? salePrice.house
      : selectedType === 'unit'
        ? salePrice.unit
        : null;

  const points =
    selectedType === 'house'
      ? series?.house
      : selectedType === 'unit'
        ? series?.unit
        : null;

  const history: HistoricalPoint[] = (points ?? []).map(
    (point) => ({
      date: point.date,
      price: point.value,
      rent: null,
    })
  );

  return {
    suburb: salePrice.area_name,
    state: supportedSuburb.state,
    postcode: postcode || '',
    propertyType,
    medianSalePrice,
    medianWeeklyRent: null,
    salesCount: null,
    daysOnMarket: null,
    annualPriceGrowth: null,
    grossRentalYield: null,
    history,
    dataPeriodLabel: salePrice.as_of
      ? `Sale price data updated ${salePrice.as_of}`
      : undefined,
  };
}
