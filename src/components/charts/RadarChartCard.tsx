"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

export interface RadarDatum {
  dimension: string;
  score: number;
}

export function RadarChartCard({ data, color = "#5ce1e6" }: { data: RadarDatum[]; color?: string }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke="#262b36" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fill: "#e8eaf0", fontSize: 12, opacity: 0.75 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fill: "#e8eaf0", fontSize: 10, opacity: 0.35 }}
            axisLine={false}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke={color}
            fill={color}
            fillOpacity={0.25}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
