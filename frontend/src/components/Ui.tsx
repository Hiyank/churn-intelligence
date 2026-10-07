import type { ReactNode } from "react";

export const Card = ({ children, className = "", style }: { children: ReactNode; className?: string; style?: React.CSSProperties }) =>
  <div className={`card rise p-5 ${className}`} style={style}>{children}</div>;

export const Title = ({ children, sub }: { children: ReactNode; sub?: string }) => (
  <div className="mb-4"><h3 className="font-display text-base font-semibold">{children}</h3>{sub && <p className="mt-0.5 text-xs text-mute">{sub}</p>}</div>
);

export function Kpi({ icon, label, value, tag, tone = "#5b8cff", delay = 0 }:
  { icon: ReactNode; label: string; value: string; tag: string; tone?: string; delay?: number }) {
  return (
    <Card className="!p-4" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center justify-between">
        <span className="grid h-9 w-9 place-items-center rounded-xl" style={{ background: `${tone}22`, color: tone }}>{icon}</span>
        <span className="rounded-full border border-line px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-mute">{tag}</span>
      </div>
      <div className="mt-3 font-display text-2xl font-bold tabular-nums">{value}</div>
      <div className="text-xs text-mute">{label}</div>
    </Card>
  );
}

export function Segmented({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div className="flex rounded-xl border border-line bg-bg p-1" role="radiogroup">
      {options.map((o) => (
        <button key={o} type="button" role="radio" aria-checked={value === o} onClick={() => onChange(o)}
          className={`flex-1 rounded-lg px-2 py-2 text-sm font-medium transition ${value === o ? "bg-[#1b2c55] text-white shadow" : "text-mute hover:text-white"}`}>{o}</button>
      ))}
    </div>
  );
}

export const Field = ({ label, unit, children }: { label: string; unit?: string; children: ReactNode }) => (
  <label className="block"><span className="mb-1.5 flex justify-between text-xs font-medium text-mute"><span>{label}</span><span>{unit}</span></span>{children}</label>
);

export const numInput = "w-full rounded-xl border border-line bg-bg px-3 py-2.5 text-sm tabular-nums outline-none transition focus:border-[#5b8cff]";
