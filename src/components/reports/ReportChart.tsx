/**
 * Report Chart Component
 */

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ReportChartProps {
  data: any[];
  type: "line" | "bar" | "pie";
  dataKey: string;
  nameKey?: string;
  valueKey?: string;
  colors?: string[];
  height?: number;
}

const DEFAULT_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#84cc16",
];

export default function ReportChart({
  data,
  type,
  dataKey,
  nameKey = "name",
  valueKey = "value",
  colors = DEFAULT_COLORS,
  height = 300,
}: ReportChartProps) {
  // Ensure data is always an array
  const safeData = Array.isArray(data) ? data : [];

  if (!safeData || safeData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No data available for chart</p>
      </div>
    );
  }

  switch (type) {
    case "line":
      return (
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={safeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={dataKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey={valueKey}
              stroke={colors[0]}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      );

    case "bar":
      return (
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={safeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={dataKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={valueKey} fill={colors[0]} />
          </BarChart>
        </ResponsiveContainer>
      );

      case "pie":
      const pieData = safeData.map((item, index) => ({
        name: item[nameKey] || item[dataKey] || `Item ${index + 1}`,
        value: item[valueKey] || item[dataKey] || 0,
      }));

      return (
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );

    default:
      return null;
  }
}

