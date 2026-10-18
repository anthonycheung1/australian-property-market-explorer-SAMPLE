import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { HistoricalPoint } from '../types/property';
import { formatCurrency } from '../utils/formatters';

type RentChartProps = {
  data: HistoricalPoint[];
};

export default function RentChart({ data }: RentChartProps) {
  const chartData = data
    .filter((point) => point.date && point.rent !== null)
    .map((point) => ({ date: point.date, rent: point.rent as number }));

  return (
    <section className="panel" aria-labelledby="rent-chart-heading">
      <h2 id="rent-chart-heading">Historical median weekly rent</h2>
      {chartData.length === 0 ? (
        <p className="empty-state">Historical rent data is not available for this suburb.</p>
      ) : (
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 12, right: 16, bottom: 8, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis
                tickFormatter={(value: number) => formatCurrency(value, true)}
                width={78}
                tick={{ fontSize: 12 }}
              />
              <Tooltip formatter={(value) => `${formatCurrency(Number(value))}/week`} />
              <Line type="monotone" dataKey="rent" name="Median weekly rent" stroke="#0f766e" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}