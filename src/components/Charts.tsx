"use client";
import {
  Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

const C = {
  s1: "var(--series-1)",
  s2: "var(--series-2)",
  s3: "var(--series-3)",
  grid: "var(--grid)",
  text: "var(--text-secondary)",
};

type PDRow = { nama: string; aktif: number; tidak_aktif: number; pembentukan: number };

export function PDPerPWChart({ data }: { data: PDRow[] }) {
  if (data.length === 0)
    return <p className="py-10 text-center text-sm text-stone-500">Belum ada data PD.</p>;
  const height = Math.max(160, data.length * 30 + 60);
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }} barCategoryGap={6}>
          <CartesianGrid horizontal={false} stroke={C.grid} />
          <XAxis type="number" allowDecimals={false} tick={{ fill: C.text, fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="nama" width={170} tick={{ fill: C.text, fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip cursor={{ fill: "rgba(0,0,0,0.04)" }} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
          <Legend verticalAlign="top" align="left" iconType="square" wrapperStyle={{ fontSize: 12, paddingBottom: 8 }} />
          <Bar dataKey="aktif" name="Aktif" stackId="a" fill={C.s1} stroke="#fff" strokeWidth={2} />
          <Bar dataKey="tidak_aktif" name="Tidak aktif" stackId="a" fill={C.s2} stroke="#fff" strokeWidth={2} />
          <Bar dataKey="pembentukan" name="Dalam pembentukan" stackId="a" fill={C.s3} stroke="#fff" strokeWidth={2} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SimpleBarChart({ data, label }: { data: { nama: string; jumlah: number }[]; label: string }) {
  if (data.length === 0)
    return <p className="py-10 text-center text-sm text-stone-500">Belum ada data.</p>;
  const height = Math.max(160, data.length * 26 + 40);
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 32, top: 4, bottom: 4 }} barCategoryGap={5}>
          <CartesianGrid horizontal={false} stroke={C.grid} />
          <XAxis type="number" allowDecimals={false} tick={{ fill: C.text, fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="nama" width={170} tick={{ fill: C.text, fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip cursor={{ fill: "rgba(0,0,0,0.04)" }} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
          <Bar dataKey="jumlah" name={label} fill={C.s1} radius={[0, 4, 4, 0]}
            label={{ position: "right", fill: C.text, fontSize: 11 }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
