import { useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, BarChart3, Database, ShieldAlert, ShieldCheck, TrendingDown, UserCheck, UserMinus, Users, Gauge as GaugeIcon } from "lucide-react";
import { getHistorical, predict } from "./api";
import type { Assessment, Bin, Customer, Historical, Prediction, Risk } from "./types";
import Gauge, { riskColor } from "./components/Gauge";
import CustomerForm, { DEFAULTS, validate } from "./components/CustomerForm";
import { GroupChart, GroupRow, RiskDonut, SplitChart } from "./components/Charts";
import HistoryTable from "./components/HistoryTable";
import { Card, Kpi } from "./components/Ui";

const TONE: Record<Risk, string> = { LOW: "#22c55e", MEDIUM: "#f59e0b", HIGH: "#ef4444" };
const pct = (n: number, d: number) => (d ? (n / d) * 100 : 0);

function groupRows(bins: Bin[] | undefined, items: Assessment[], get: (c: Customer) => string | number): GroupRow[] | null {
  if (!bins) return null;
  const idx = (v: string | number) => bins.findIndex((b, i) => (b.hi === undefined ? b.label === v : typeof v === "number" && (v <= b.hi || i === bins.length - 1)));
  const buckets = bins.map(() => [0, 0]);
  items.forEach((a) => { const i = idx(get(a.customer)); if (i >= 0) { buckets[i][0] += a.result.prediction; buckets[i][1] += 1; } });
  return bins.map((b, i) => ({ label: b.label, actual: b.rate, n: buckets[i][1], predicted: buckets[i][1] ? Math.round(pct(buckets[i][0], buckets[i][1]) * 10) / 10 : null }));
}

export default function App() {
  const [form, setForm] = useState<Customer>(DEFAULTS);
  const [result, setResult] = useState<Prediction | null>(null);
  const [items, setItems] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hist, setHist] = useState<Historical | null>(null);
  const [histErr, setHistErr] = useState<string | null>(null);

  useEffect(() => { getHistorical().then(setHist).catch((e: Error) => setHistErr(e.message)); }, []);

  async function run() {
    const v = validate(form);
    if (v) return setError(v);
    setError(null); setLoading(true);
    try {
      const r = await predict(form);
      setResult(r);
      setItems((p) => [{ id: Date.now(), time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), customer: form, result: r }, ...p]);
    } catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  }

  const s = useMemo(() => {
    const n = items.length, churn = items.filter((a) => a.result.prediction === 1).length;
    const c = (r: Risk) => items.filter((a) => a.result.risk === r).length;
    return { n, churn, high: c("HIGH"), med: c("MEDIUM"), low: c("LOW"), avg: n ? items.reduce((t, a) => t + a.result.probability, 0) / n : 0 };
  }, [items]);

  const b = hist?.breakdowns;
  const tone = result ? TONE[result.risk] : "#3a4766";
  const f1 = (x: number) => `${x.toFixed(1)}%`;

  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-16 pt-6 sm:px-8">
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#3d6bff] to-[#2dd4bf]"><Activity className="h-5 w-5 text-white" /></div>
          <div><h1 className="font-display text-lg font-bold tracking-[0.12em]">CHURN INTELLIGENCE</h1><p className="text-xs text-mute">Customer retention risk, scored by your Random Forest model</p></div>
        </div>
        <div className="hidden items-center gap-2 rounded-full border border-line px-3 py-1.5 text-xs text-mute sm:flex"><Database className="h-3.5 w-3.5" />{hist ? `Dataset: ${hist.total.toLocaleString()} customers` : "Dataset not connected"}</div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[430px_1fr]">
        <CustomerForm value={form} onChange={setForm} onSubmit={run} loading={loading} error={error}
          onReset={() => { setForm(DEFAULTS); setResult(null); setError(null); }} />
        <Card className={`flex flex-col justify-center !p-6 sm:!p-8 ${result?.risk === "HIGH" ? "risk-high" : ""}`}>
          <Gauge probability={result ? result.probability : null} />
          {result ? (
            <div className="mt-6 space-y-4">
              <div className="flex flex-wrap items-center justify-center gap-3">
                <span className={`rounded-full px-4 py-1.5 text-sm font-bold tracking-wide ${result.risk === "HIGH" ? "blink" : ""}`} style={{ color: tone, background: `${tone}1f`, border: `1px solid ${tone}66` }}>{result.risk} RISK</span>
                <span className="flex items-center gap-2 rounded-full border border-line px-4 py-1.5 text-sm font-semibold">
                  {result.prediction ? <UserMinus className="h-4 w-4 text-red-400" /> : <UserCheck className="h-4 w-4 text-green-400" />}{result.prediction ? "Churn" : "No Churn"}
                </span>
              </div>
              <div className="rounded-xl bg-bg p-4 text-sm leading-relaxed" style={{ borderLeft: `4px solid ${tone}` }}>
                <div className="mb-1 flex items-center gap-2 font-semibold" style={{ color: tone }}>{result.risk === "LOW" ? <ShieldCheck className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}Recommendation</div>
                <span className="text-[#c4d0e8]">{result.recommendation}</span>
              </div>
            </div>
          ) : <p className="mt-6 text-center text-sm text-mute">Fill in the profile and select Predict Churn. The gauge will move to the customer's risk.</p>}
        </Card>
      </section>

      <section className="mt-10">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-xl font-bold">Live analytics</h2>
          <p className="text-xs text-mute">Session figures cover only customers you assess here. Dataset figures are historical.</p>
        </div>
        {histErr && <p className="mb-4 flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200"><AlertTriangle className="h-4 w-4 shrink-0" />{histErr}</p>}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Kpi icon={<Database className="h-4 w-4" />} label="Historical churn rate" value={hist ? f1(hist.churn_rate) : "N/A"} tag="Dataset" tone="#6c8cff" />
          <Kpi icon={<TrendingDown className="h-4 w-4" />} label="Predicted churn rate" value={s.n ? f1(pct(s.churn, s.n)) : "N/A"} tag="Session" tone="#2dd4bf" delay={40} />
          <Kpi icon={<ShieldAlert className="h-4 w-4" />} label="High-risk rate" value={s.n ? f1(pct(s.high, s.n)) : "N/A"} tag="Session" tone="#ef4444" delay={80} />
          <Kpi icon={<GaugeIcon className="h-4 w-4" />} label="Average churn probability" value={s.n ? f1(s.avg) : "N/A"} tag="Session" tone={s.n ? riskColor(s.avg) : "#8b9bb8"} delay={120} />
          <Kpi icon={<Users className="h-4 w-4" />} label="Customers assessed" value={String(s.n)} tag="Session" delay={160} />
          <Kpi icon={<UserMinus className="h-4 w-4" />} label="Predicted churners" value={String(s.churn)} tag="Session" tone="#ef4444" delay={200} />
          <Kpi icon={<ShieldAlert className="h-4 w-4" />} label="High / Medium risk" value={`${s.high} / ${s.med}`} tag="Session" tone="#f59e0b" delay={240} />
          <Kpi icon={<ShieldCheck className="h-4 w-4" />} label="Low risk customers" value={String(s.low)} tag="Session" tone="#22c55e" delay={280} />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <RiskDonut low={s.low} med={s.med} high={s.high} />
          <SplitChart churn={s.churn} stay={s.n - s.churn} />
          <GroupChart title="Churn by subscription type" rows={groupRows(b?.subscription_type, items, (c) => c.subscription_type)} />
          <GroupChart title="Churn by contract length" rows={groupRows(b?.contract_length, items, (c) => c.contract_length)} />
          <GroupChart title="Churn by payment delay (days)" rows={groupRows(b?.payment_delay, items, (c) => c.payment_delay)} />
          <GroupChart title="Churn by support calls" rows={groupRows(b?.support_calls, items, (c) => c.support_calls)} />
          <GroupChart title="Churn by usage frequency" rows={groupRows(b?.usage_frequency, items, (c) => c.usage_frequency)} />
        </div>
      </section>

      <section className="mt-6"><HistoryTable items={items} onClear={() => { setItems([]); setResult(null); }} /></section>
      <p className="mt-10 flex items-center justify-center gap-2 text-xs text-mute"><BarChart3 className="h-3.5 w-3.5" />Churn Intelligence</p>
    </div>
  );
}
