import { Loader2, RotateCcw, Zap } from "lucide-react";
import type { Customer } from "../types";
import { Card, Field, Segmented, Title, numInput } from "./Ui";

export const DEFAULTS: Customer = {
  age: 35, tenure: 12, usage_frequency: 15, support_calls: 3, payment_delay: 10, total_spend: 450,
  gender: "Male", subscription_type: "Basic", contract_length: "Monthly",
};

const NUMS: { key: keyof Customer; label: string; unit?: string; min: number; max: number; step?: number }[] = [
  { key: "age", label: "Age", unit: "years", min: 18, max: 100 },
  { key: "tenure", label: "Tenure", unit: "months", min: 0, max: 100 },
  { key: "usage_frequency", label: "Usage frequency", min: 0, max: 100 },
  { key: "support_calls", label: "Support calls", min: 0, max: 100 },
  { key: "payment_delay", label: "Payment delay", unit: "days", min: 0, max: 100 },
  { key: "total_spend", label: "Total spend", min: 0, max: 1000000, step: 50 },
];

export function validate(c: Customer) {
  for (const n of NUMS) {
    const v = c[n.key] as number;
    if (!Number.isFinite(v) || v < n.min || v > n.max) return `${n.label} must be between ${n.min} and ${n.max}.`;
  }
  return null;
}

interface Props { value: Customer; onChange: (c: Customer) => void; onSubmit: () => void; onReset: () => void; loading: boolean; error: string | null }

export default function CustomerForm({ value, onChange, onSubmit, onReset, loading, error }: Props) {
  const set = (k: keyof Customer, v: string | number) => onChange({ ...value, [k]: v });
  return (
    <Card>
      <Title sub="Enter the customer's details, then run the model.">Customer profile</Title>
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
        <Field label="Gender"><Segmented value={value.gender} options={["Male", "Female"]} onChange={(v) => set("gender", v)} /></Field>
        <Field label="Subscription type"><Segmented value={value.subscription_type} options={["Basic", "Standard", "Premium"]} onChange={(v) => set("subscription_type", v)} /></Field>
        <Field label="Contract length"><Segmented value={value.contract_length} options={["Monthly", "Quarterly", "Annual"]} onChange={(v) => set("contract_length", v)} /></Field>
        <div className="grid grid-cols-2 gap-3">
          {NUMS.map((n) => (
            <Field key={n.key} label={n.label} unit={n.unit}>
              <input type="number" className={numInput} min={n.min} max={n.max} step={n.step ?? 1} value={Number.isNaN(value[n.key] as number) ? "" : (value[n.key] as number)}
                onChange={(e) => set(n.key, e.target.value === "" ? NaN : Number(e.target.value))} />
            </Field>
          ))}
        </div>
        {error && <p role="alert" className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
        <div className="flex gap-3 pt-1">
          <button type="submit" disabled={loading}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#3d6bff] px-4 py-3 font-semibold text-white transition hover:bg-[#5580ff] disabled:opacity-60">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}{loading ? "Scoring..." : "Predict Churn"}
          </button>
          <button type="button" onClick={onReset} className="flex items-center gap-2 rounded-xl border border-line px-4 py-3 text-sm font-medium text-mute transition hover:text-white">
            <RotateCcw className="h-4 w-4" />New Customer
          </button>
        </div>
      </form>
    </Card>
  );
}
