"use client";
import { CHART_AXIS_TEXT, CHART_GRID, SERIES } from "./palette";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Cell } from "recharts";

export interface DimensionBarDatum {
  label: string;
  score: number;
}

const COLORS = SERIES;

export function DimensionBarChart({ data }: { data: DimensionBarDatum[] }) {
  return (
    <div style={{ height: Math.max(180, data.length * 44) }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24 }}>
          <CartesianGrid horizontal={false} stroke={CHART_GRID} />
          <XAxis type="number" domain={[0, 100]} tick={{ fill: CHART_AXIS_TEXT, fontSize: 12, opacity: 0.45 }} axisLine={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey="label"
            width={140}
            tick={{ fill: CHART_AXIS_TEXT, fontSize: 12, opacity: 0.8 }}
            axisLine={false}
            tickLine={false}
          />
          <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={16}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
