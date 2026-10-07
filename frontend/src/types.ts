export type Risk = "LOW" | "MEDIUM" | "HIGH";
export interface Customer {
  age: number; tenure: number; usage_frequency: number; support_calls: number; payment_delay: number;
  total_spend: number; gender: string; subscription_type: string; contract_length: string;
}
export interface Prediction { probability: number; prediction: 0 | 1; risk: Risk; recommendation: string }
export interface Assessment { id: number; time: string; customer: Customer; result: Prediction }
export interface Bin { label: string; hi?: number; rate: number; count: number }
export interface Historical { total: number; churn_rate: number; breakdowns: Record<string, Bin[]> }
