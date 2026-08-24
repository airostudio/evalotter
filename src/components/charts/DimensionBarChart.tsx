"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Cell } from "recharts";

export interface DimensionBarDatum {
  label: string;
  score: number;
}

const COLORS = ["#7c5cff", "#5ce1e6", "#3d7cff", "#a5b0f7", "#5b63e6"];

export function DimensionBarChart({ data }: { data: DimensionBarDatum[] }) {
  return (
    <div style={{ height: Math.max(180, data.length * 44) }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24 }}>
          <CartesianGrid horizontal={false} stroke="#20293d" />
          <XAxis type="number" domain={[0, 100]} tick={{ fill: "#e8eaf0", fontSize: 11, opacity: 0.4 }} axisLine={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey="label"
            width={140}
            tick={{ fill: "#e8eaf0", fontSize: 12, opacity: 0.75 }}
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
