import type {
  PropertyType,
  PropertyTypeMetrics,
  SuburbMarketData,
} from '../types/property';

interface SuburbOverviewProps {
  data: SuburbMarketData;
  propertyType: PropertyType;
}

function formatCurrency(value: number | null): string {
  if (value === null || !Number.isFinite(value)) {
    return 'Not available';
  }

  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number | null): string {
  if (value === null || !Number.isFinite(value)) {
    return 'Not available';
  }

  return `${value.toFixed(2)}%`;
}

function formatNumber(value: number | null): string {
  if (value === null || !Number.isFinite(value)) {
    return 'Not available';
  }

  return new Intl.NumberFormat('en-AU', {
    maximumFractionDigits: 0,
  }).format(value);
}

function getMetrics(
  data: SuburbMarketData,
  propertyType: PropertyType,
): PropertyTypeMetrics {
  if (propertyType === 'House') {
    return data.byType.House;
  }

  if (propertyType === 'Unit') {
    return data.byType.Unit;
  }

  return {
    medianSalePrice: data.medianSalePrice,
    medianWeeklyRent: data.medianWeeklyRent,
    grossRentalYield: data.grossRentalYield,
    annualPriceGrowth: data.annualPriceGrowth,
    priceGrowth5y: data.priceGrowth5y,
    salesCount: data.salesCount,
    daysOnMarket: data.daysOnMarket,
  };
}

export default function SuburbOverview({
  data,
  propertyType,
}: SuburbOverviewProps) {
  const metrics = getMetrics(data, propertyType);

  const cards = [
    {
      label: 'Median sale price',
      value: formatCurrency(metrics.medianSalePrice),
      description: 'Typical sale price',
    },
    {
      label: 'Median weekly rent',
      value:
        metrics.medianWeeklyRent === null
          ? 'Not available'
          : `${formatCurrency(metrics.medianWeeklyRent)}/wk`,
      description: 'Typical weekly rent',
    },
    {
      label: 'Gross rental yield',
      value: formatPercent(metrics.grossRentalYield),
      description: 'Estimated annual rent relative to price',
    },
    {
      label: 'Annual price growth',
      value: formatPercent(metrics.annualPriceGrowth),
      description: 'Price growth over one year',
    },
    {
      label: 'Five-year price growth',
      value: formatPercent(metrics.priceGrowth5y),
      description: 'Cumulative growth over five years',
    },
    {
      label: 'Days on market',
      value: formatNumber(metrics.daysOnMarket),
      description: 'Typical selling time',
    },
    {
      label: 'Transactions',
      value: formatNumber(metrics.salesCount),
      description: 'Recent reported sales',
    },
  ];

  return (
    <section className="suburb-overview" aria-labelledby="overview-heading">
      <div className="section-heading">
        <div>
          <h2 id="overview-heading">Market overview</h2>
          <p>
            {propertyType === 'All'
              ? 'Combined view of available house and unit indicators.'
              : `Market indicators for ${propertyType.toLowerCase()}s.`}
          </p>
        </div>
      </div>

      <div className="stat-grid">
        {cards.map((card) => (
          <article className="stat-card" key={card.label}>
            <p className="stat-card-label">{card.label}</p>
            <p className="stat-card-value">{card.value}</p>
            <p className="stat-card-description">{card.description}</p>
          </article>
        ))}
      </div>

      {data.dataPeriodLabel && (
        <p className="data-period">
          Market data date: {data.dataPeriodLabel}
        </p>
      )}
    </section>
  );
}