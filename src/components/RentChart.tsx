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

interface RentChartProps {
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

function formatRent(value: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function RentChart({
  data,
  propertyType,
}: RentChartProps) {
  const chartData = data.map((point) => ({
    ...point,
    dateLabel: formatDate(point.date),
    houseRent:
      point.houseRent ?? (propertyType === 'House' ? point.rent : null),
    unitRent:
      point.unitRent ?? (propertyType === 'Unit' ? point.rent : null),
  }));

  const hasData = chartData.some((point) =>
    propertyType === 'All'
      ? point.houseRent !== null || point.unitRent !== null
      : point.rent !== null,
  );

  return (
    <section className="chart-card">
      <h2>Historical weekly rents</h2>
      <p className="chart-description">
        Historical median weekly rents by property type.
      </p>

      {!hasData ? (
        <p className="empty-state">
          Historical rent data is not available for this suburb.
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
                tickFormatter={formatRent}
                width={85}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                labelFormatter={(_, payload) =>
                  payload?.[0]?.payload?.date ?? ''
                }
                formatter={(value, name) => [
                  typeof value === 'number'
                    ? `${formatRent(value)} per week`
                    : 'Not available',
                  name,
                ]}
              />
              {propertyType === 'All' && <Legend />}
              {propertyType === 'All' ? (
                <>
                  <Line
                    type="monotone"
                    dataKey="houseRent"
                    name="House"
                    stroke="#2563eb"
                    dot={false}
                    connectNulls
                  />
                  <Line
                    type="monotone"
                    dataKey="unitRent"
                    name="Unit"
                    stroke="#d97706"
                    dot={false}
                    connectNulls
                  />
                </>
              ) : (
                <Line
                  type="monotone"
                  dataKey="rent"
                  name="Median weekly rent"
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