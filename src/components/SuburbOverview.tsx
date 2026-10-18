import type { SuburbMarketData } from '../types/property';
import {
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatWeeklyRent,
} from '../utils/formatters';
import StatCard from './StatCard.tsx';

type SuburbOverviewProps = {
  data: SuburbMarketData;
};

export default function SuburbOverview({ data }: SuburbOverviewProps) {
  return (
    <section aria-labelledby="overview-heading">
      <div className="section-heading">
        <div>
          <p className="eyebrow">SUBURB OVERVIEW</p>
          <h2 id="overview-heading">
            {data.suburb}, {data.state} {data.postcode}
          </h2>
        </div>
        <p className="data-period">
          {data.dataPeriodLabel ?? 'Period not supplied by API'}
        </p>
      </div>

      <div className="stats-grid">
        <StatCard label="Median sale price" value={formatCurrency(data.medianSalePrice)} />
        <StatCard label="Median weekly rent" value={formatWeeklyRent(data.medianWeeklyRent)} />
        <StatCard label="Gross rental yield" value={formatPercentage(data.grossRentalYield)} />
        <StatCard label="Annual price growth" value={formatPercentage(data.annualPriceGrowth)} />
        <StatCard label="Sales" value={formatNumber(data.salesCount)} />
        <StatCard label="Days on market" value={formatNumber(data.daysOnMarket)} />
      </div>
    </section>
  );
}