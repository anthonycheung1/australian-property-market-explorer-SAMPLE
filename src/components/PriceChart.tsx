import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type {
  HistoricalPoint,
  PropertyType,
} from '../types/property';

interface PriceChartProps {
  data: HistoricalPoint[];
  propertyType: PropertyType;
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-AU', {
    month: 'short',
    year: 'numeric',
  });
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

export default function PriceChart({
  data,
  propertyType,
}: PriceChartProps) {
  const chartData = data.map((point) => ({
    ...point,
    dateLabel: formatDate(point.date),
    housePrice:
      point.housePrice ?? (propertyType === 'House' ? point.price : null),
    unitPrice:
      point.unitPrice ?? (propertyType === 'Unit' ? point.price : null),
  }));

  const hasData = chartData.some((point) =>
    propertyType === 'All'
      ? point.housePrice !== null || point.unitPrice !== null
      : point.price !== null,
  );

  return (
    <section className="chart-card">
      <h2>Historical sale prices</h2>
      <p className="chart-description">
        Historical median sale prices by property type.
      </p>

      {!hasData ? (
        <p className="empty-state">
          Historical sale price data is not available for this suburb.
        </p>
      ) : (
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={320}>
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 20, bottom: 5, left: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="dateLabel"
                minTickGap={30}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                tickFormatter={formatPrice}
                width={85}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                labelFormatter={(_, payload) =>
                  payload?.[0]?.payload?.date ?? ''
                }
                formatter={(value, name) => [
                  typeof value === 'number'
                    ? formatPrice(value)
                    : 'Not available',
                  name,
                ]}
              />
              {propertyType === 'All' && <Legend />}
              {propertyType === 'All' ? (
                <>
                  <Line
                    type="monotone"
                    dataKey="housePrice"
                    name="House"
                    stroke="#2563eb"
                    dot={false}
                    connectNulls
                  />
                  <Line
                    type="monotone"
                    dataKey="unitPrice"
                    name="Unit"
                    stroke="#d97706"
                    dot={false}
                    connectNulls
                  />
                </>
              ) : (
                <Line
                  type="monotone"
                  dataKey="price"
                  name="Median sale price"
                  stroke="#2563eb"
                  dot={false}
                  connectNulls
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}