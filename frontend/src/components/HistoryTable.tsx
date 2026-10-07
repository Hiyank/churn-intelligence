import { Trash2 } from "lucide-react";
import type { Assessment, Risk } from "../types";
import { riskColor } from "./Gauge";
import { Card, Title } from "./Ui";

const chip: Record<Risk, string> = { LOW: "#22c55e", MEDIUM: "#f59e0b", HIGH: "#ef4444" };

export default function HistoryTable({ items, onClear }: { items: Assessment[]; onClear: () => void }) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <Title sub="Most recent first. Kept until you refresh the page.">Recent assessments</Title>
        {items.length > 0 && <button onClick={onClear} className="flex items-center gap-1.5 text-xs text-mute hover:text-white"><Trash2 className="h-3.5 w-3.5" />Clear</button>}
      </div>
      {items.length === 0 ? <p className="py-8 text-center text-sm text-mute">No assessments yet.</p> : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-xs text-mute"><tr><th className="pb-2 font-medium">Customer</th><th className="pb-2 font-medium">Probability</th><th className="pb-2 font-medium">Prediction</th><th className="pb-2 font-medium">Risk</th><th className="pb-2 text-right font-medium">Time</th></tr></thead>
            <tbody>
              {items.slice(0, 10).map((a) => (
                <tr key={a.id} className="border-t border-line">
                  <td className="py-3 pr-4">{a.customer.age}y, {a.customer.gender} <span className="text-mute">· {a.customer.subscription_type} · {a.customer.contract_length} · {a.customer.tenure} mo · {a.customer.payment_delay}d delay</span></td>
                  <td className="py-3 pr-4"><div className="flex items-center gap-2"><div className="h-1.5 w-20 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full" style={{ width: `${a.result.probability}%`, background: riskColor(a.result.probability) }} /></div><span className="tabular-nums">{a.result.probability.toFixed(1)}%</span></div></td>
                  <td className="py-3 pr-4 font-medium">{a.result.prediction ? "Churn" : "No Churn"}</td>
                  <td className="py-3 pr-4"><span className="rounded-full px-2.5 py-1 text-xs font-bold" style={{ color: chip[a.result.risk], background: `${chip[a.result.risk]}1f` }}>{a.result.risk}</span></td>
                  <td className="py-3 text-right text-xs text-mute">{a.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
