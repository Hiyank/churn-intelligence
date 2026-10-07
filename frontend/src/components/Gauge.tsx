import { useEffect, useRef, useState } from "react";

const STOPS: [number, number[]][] = [[0, [34, 197, 94]], [25, [34, 197, 94]], [35, [245, 158, 11]], [55, [245, 158, 11]], [65, [239, 68, 68]], [100, [239, 68, 68]]];

export function riskColor(p: number) {
  for (let i = 1; i < STOPS.length; i++) {
    if (p <= STOPS[i][0]) {
      const [a, ca] = STOPS[i - 1], [b, cb] = STOPS[i];
      const t = (p - a) / (b - a || 1);
      return `rgb(${ca.map((c, k) => Math.round(c + (cb[k] - c) * t)).join(",")})`;
    }
  }
  return "rgb(239,68,68)";
}

export function useTween(target: number, ms = 1000) {
  const [v, setV] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    const s = from.current, t0 = performance.now();
    let raf = 0;
    const tick = (n: number) => {
      const k = Math.min(1, (n - t0) / ms);
      const cur = s + (target - s) * (1 - Math.pow(1 - k, 3));
      from.current = cur; setV(cur);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

const ARC = "M 30 150 A 120 120 0 0 1 270 150";

export default function Gauge({ probability }: { probability: number | null }) {
  const v = useTween(probability ?? 0);
  const col = probability === null ? "#3a4766" : riskColor(v);
  const angle = -90 + v * 1.8;
  const zone = (dash: number, off: number, c: string) => (
    <path d={ARC} pathLength={100} fill="none" stroke={c} strokeOpacity={0.2} strokeWidth={18}
      strokeDasharray={`${dash} 100`} strokeDashoffset={-off} />
  );
  return (
    <div className="mx-auto w-full max-w-[520px]">
      <svg viewBox="0 0 300 180" className="w-full" role="img" aria-label={probability === null ? "Gauge idle" : `Churn probability ${Math.round(v)} percent`}>
        {zone(30, 0, "#22c55e")}{zone(30, 30, "#f59e0b")}{zone(40, 60, "#ef4444")}
        <path d={ARC} pathLength={100} fill="none" stroke={col} strokeWidth={18} strokeDasharray={`${v} 100`}
          style={{ filter: probability === null ? "none" : `drop-shadow(0 0 8px ${col})` }} />
        <g style={{ transform: `rotate(${angle}deg)`, transformOrigin: "150px 150px" }}>
          <line x1={150} y1={150} x2={150} y2={48} stroke="#e8eefb" strokeWidth={4} strokeLinecap="round" />
        </g>
        <circle cx={150} cy={150} r={11} fill="#0d1424" stroke={col} strokeWidth={5} />
        {[["0", 30], ["30", 62], ["60", 238], ["100", 270]].map(([t, x], i) => (
          <text key={t as string} x={x as number} y={i === 0 || i === 3 ? 172 : 38 + (i === 1 ? 12 : 12)} fill="#8b9bb8" fontSize={10} textAnchor="middle">{t}%</text>
        ))}
      </svg>
      <div className="-mt-6 text-center">
        <div className="font-display text-7xl font-bold tabular-nums tracking-tight transition-colors" style={{ color: col }}>
          {probability === null ? "--" : `${v.toFixed(0)}%`}
        </div>
        <div className="mt-1 text-sm text-mute">Probability of churn</div>
      </div>
    </div>
  );
}
