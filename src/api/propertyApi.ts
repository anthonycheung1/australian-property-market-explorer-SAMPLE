
import type {
  HistoricalPoint,
  PropertyType,
  SuburbMarketData,
  SuburbSuggestion,
} from '../types/property';

const API_BASE_URL =
  'https://property-yield-proxy.tonycheung75.workers.dev/';

// Microburbs demo-supported suburbs.
// Postcodes are left blank because they are not required by this API.
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

// Microburbs response types
interface RentalYieldData {
  area_name: string;
  area_level: string;
  as_of: string;
  house: number | null;
  unit: number | null;
}

interface RentalYieldResponse {
  data: RentalYieldData;
}

/**
 * Search the locally defined list of supported demo suburbs.
 *
 * Microburbs' current demo setup does not provide the general
 * Domain-style location-search endpoint used by the original code.
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
 * Fetch rental-yield data from the Cloudflare Worker.
 */
async function fetchRentalYield(
  suburb: string,
  signal?: AbortSignal
): Promise<RentalYieldData> {
  const url = new URL(API_BASE_URL);
  url.searchParams.set('suburb', suburb);

  const response = await fetch(url, {
    method: 'GET',
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

  const result: RentalYieldResponse = await response.json();

  if (!result.data) {
    throw new Error(
      'The API response did not contain rental-yield data.'
    );
  }

  return result.data;
}

/**
 * Convert a Microburbs rental-yield response into the existing
 * SuburbMarketData format.
 *
 * Microburbs returns yields as decimal fractions:
 * 0.0335 = 3.35%.
 *
 * Metrics not supplied by this endpoint are represented as null.
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

  const raw = await fetchRentalYield(
    supportedSuburb.name,
    signal
  );

  if (
    raw.area_name.toLowerCase() !==
    supportedSuburb.name.toLowerCase()
  ) {
    throw new Error(
      'The API returned data for an unexpected suburb.'
    );
  }

  const history: HistoricalPoint[] = [];

  const selectedType = String(propertyType).toLowerCase();

  let grossRentalYield: number | null = null;

  if (selectedType === 'house') {
    grossRentalYield =
      raw.house === null ? null : raw.house * 100;
  } else if (selectedType === 'unit') {
    grossRentalYield =
      raw.unit === null ? null : raw.unit * 100;
  }

  return {
    suburb: raw.area_name,
    state: supportedSuburb.state,
    postcode: postcode || '',
    propertyType,
    medianSalePrice: null,
    medianWeeklyRent: null,
    salesCount: null,
    daysOnMarket: null,
    annualPriceGrowth: null,
    grossRentalYield,
    history,
    dataPeriodLabel: raw.as_of
      ? `Rental yield data updated ${raw.as_of}`
      : undefined,
  };
}
