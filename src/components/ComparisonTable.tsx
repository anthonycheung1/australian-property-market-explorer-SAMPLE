import type { SuburbMarketData } from '../types/property';
import {
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatWeeklyRent,
} from '../utils/formatters';

type ComparisonTableProps = {
  suburbs: SuburbMarketData[];
};

export default function ComparisonTable({ suburbs }: ComparisonTableProps) {
  if (suburbs.length === 0) {
    return <p className="empty-state">Add suburbs to start comparing property markets.</p>;
  }

  return (
    <div className="table-wrapper">
      <table>
        <caption>Property market metrics by suburb</caption>
        <thead>
          <tr>
            <th scope="col">Metric</th>
            {suburbs.map((suburb) => (
              <th scope="col" key={`${suburb.state}-${suburb.postcode}-${suburb.suburb}`}>
                {suburb.suburb}, {suburb.state}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">Median sale price</th>
            {suburbs.map((s) => <td key={s.postcode}>{formatCurrency(s.medianSalePrice)}</td>)}
          </tr>
          <tr>
            <th scope="row">Median weekly rent</th>
            {suburbs.map((s) => <td key={s.postcode}>{formatWeeklyRent(s.medianWeeklyRent)}</td>)}
          </tr>
          <tr>
            <th scope="row">Gross rental yield</th>
            {suburbs.map((s) => <td key={s.postcode}>{formatPercentage(s.grossRentalYield)}</td>)}
          </tr>
          <tr>
            <th scope="row">Annual price growth</th>
            {suburbs.map((s) => <td key={s.postcode}>{formatPercentage(s.annualPriceGrowth)}</td>)}
          </tr>
          <tr>
            <th scope="row">Sales</th>
            {suburbs.map((s) => <td key={s.postcode}>{formatNumber(s.salesCount)}</td>)}
          </tr>
          <tr>
            <th scope="row">Days on market</th>
            {suburbs.map((s) => <td key={s.postcode}>{formatNumber(s.daysOnMarket)}</td>)}
          </tr>
        </tbody>
      </table>
    </div>
  );
}