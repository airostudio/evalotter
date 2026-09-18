"use client";
import { CHART_AXIS_TEXT, CHART_GRID, CHART_PRIMARY } from "./palette";

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

export function RadarChartCard({ data, color = CHART_PRIMARY }: { data: RadarDatum[]; color?: string }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke={CHART_GRID} />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fill: CHART_AXIS_TEXT, fontSize: 12, opacity: 0.8 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fill: CHART_AXIS_TEXT, fontSize: 10, opacity: 0.4 }}
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
