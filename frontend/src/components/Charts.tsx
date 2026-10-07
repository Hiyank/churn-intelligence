import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, Title } from "./Ui";

export const COL = { actual: "#6c8cff", predicted: "#2dd4bf", low: "#22c55e", med: "#f59e0b", high: "#ef4444" };
const tip = { contentStyle: { background: "#0a1020", border: "1px solid #1c2740", borderRadius: 12, fontSize: 12 }, cursor: { fill: "#ffffff0d" } };
const axis = { stroke: "#8b9bb8", fontSize: 11, tickLine: false, axisLine: false } as const;
const Empty = ({ text }: { text: string }) => <div className="grid h-52 place-items-center px-6 text-center text-sm text-mute">{text}</div>;

export function RiskDonut({ low, med, high }: { low: number; med: number; high: number }) {
  const data = [{ name: "Low", value: low, c: COL.low }, { name: "Medium", value: med, c: COL.med }, { name: "High", value: high, c: COL.high }];
  const total = low + med + high;
  return (
    <Card>
      <Title sub="Share of assessed customers by risk level">Risk distribution</Title>
      {total === 0 ? <Empty text="Assess a customer to see the distribution." /> : (
        <div className="relative h-52">
          <ResponsiveContainer><PieChart><Pie data={data} dataKey="value" innerRadius={58} outerRadius={82} paddingAngle={3} stroke="none">
            {data.map((d) => <Cell key={d.name} fill={d.c} />)}</Pie><Tooltip {...tip} /><Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} /></PieChart></ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 -mt-4 grid place-items-center text-center"><div><div className="font-display text-2xl font-bold">{total}</div><div className="text-[11px] text-mute">assessed</div></div></div>
        </div>
      )}
    </Card>
  );
}

export function SplitChart({ churn, stay }: { churn: number; stay: number }) {
  const data = [{ name: "Churn", value: churn, c: COL.high }, { name: "No churn", value: stay, c: COL.low }];
  return (
    <Card>
      <Title sub="Model decisions across assessed customers">Predicted churn vs no churn</Title>
      {churn + stay === 0 ? <Empty text="No predictions yet." /> : (
        <div className="h-52"><ResponsiveContainer><BarChart data={data}><CartesianGrid stroke="#1c2740" vertical={false} />
          <XAxis dataKey="name" {...axis} /><YAxis allowDecimals={false} {...axis} /><Tooltip {...tip} />
          <Bar dataKey="value" name="Customers" radius={[8, 8, 0, 0]}>{data.map((d) => <Cell key={d.name} fill={d.c} />)}</Bar></BarChart></ResponsiveContainer></div>
      )}
    </Card>
  );
}

export interface GroupRow { label: string; actual: number; predicted: number | null; n: number }

export function GroupChart({ title, rows }: { title: string; rows: GroupRow[] | null }) {
  return (
    <Card>
      <Title sub="Blue: actual churn in dataset. Teal: predicted churn in your assessments">{title}</Title>
      {!rows ? <Empty text="Dataset not connected, so historical churn can't be shown." /> : (
        <div className="h-52"><ResponsiveContainer><BarChart data={rows} barGap={4}><CartesianGrid stroke="#1c2740" vertical={false} />
          <XAxis dataKey="label" {...axis} /><YAxis unit="%" domain={[0, 100]} {...axis} />
          <Tooltip {...tip} formatter={(v) => (v === null || v === undefined ? "No assessments" : `${v}%`)} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="actual" name="Actual (dataset)" fill={COL.actual} radius={[6, 6, 0, 0]} />
          <Bar dataKey="predicted" name="Predicted (assessments)" fill={COL.predicted} radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div>
      )}
    </Card>
  );
}
