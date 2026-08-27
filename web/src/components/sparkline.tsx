import { useId } from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

export function Sparkline({ data, color }: { data: number[]; color: string }) {
  const gradientId = useId().replace(/:/g, "");
  const points = data.length >= 2 ? data : [data.at(0) ?? 0, data.at(0) ?? 0];

  return (
    <ResponsiveContainer width="100%" height={72}>
      <AreaChart
        data={points.map((value, index) => ({ index, value }))}
        margin={{ top: 4, right: 0, bottom: 0, left: 0 }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.8} />
            <stop offset="100%" stopColor={color} stopOpacity={0.15} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
