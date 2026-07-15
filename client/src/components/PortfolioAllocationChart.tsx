import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { SymbolAggregate } from "../utils/portfolio";

const COLORS = [
  "#22c55e",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#a855f7",
  "#06b6d4",
  "#ec4899",
  "#84cc16",
];

function PortfolioAllocationChart({
  aggregates,
}: {
  aggregates: SymbolAggregate[];
}) {
  const totalCost = aggregates.reduce((sum, a) => sum + a.totalCost, 0);
  const data = aggregates.map((a) => ({
    name: a.symbol,
    value: a.totalCost,
    pct: totalCost > 0 ? (a.totalCost / totalCost) * 100 : 0,
  }));

  return (
    <div className="border border-black/10 dark:border-white/10 rounded-xl px-6 py-5">
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
        Allocation by cost basis
      </p>
      <ResponsiveContainer width="100%" height={280} className="outline-none">
        <PieChart className="outline-none">
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={90}
            label={({ name, percent }) =>
              `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
            }
            className="outline-none"
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, _name, item) => {
              const payload = item.payload as { name: string; pct: number };
              return [
                `$${Number(value).toFixed(2)} (${payload.pct.toFixed(1)}%)`,
                payload.name,
              ];
            }}
            contentStyle={{
              backgroundColor: "#111",
              border: "none",
              borderRadius: "8px",
              color: "#fff",
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default PortfolioAllocationChart;
