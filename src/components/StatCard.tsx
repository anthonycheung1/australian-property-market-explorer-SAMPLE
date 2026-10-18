type StatCardProps = {
  label: string;
  value: string;
  detail?: string;
};

export default function StatCard({ label, value, detail }: StatCardProps) {
  return (
    <article className="stat-card">
      <h3>{label}</h3>
      <p className="stat-value">{value}</p>
      {detail && <p className="stat-detail">{detail}</p>}
    </article>
  );
}