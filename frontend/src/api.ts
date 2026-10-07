import type { Customer, Historical, Prediction } from "./types";

async function req<T>(url: string, init?: RequestInit): Promise<T> {
  let r: Response;
  try { r = await fetch(url, init); }
  catch { throw new Error("Cannot reach the API. Start the backend (uvicorn) and try again."); }
  if (!r.ok) {
    const b = await r.json().catch(() => null);
    throw new Error(typeof b?.detail === "string" ? b.detail : `Request failed (${r.status}). Check the inputs.`);
  }
  return r.json();
}

export const predict = (c: Customer) =>
  req<Prediction>("/api/predict", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(c) });
export const getHistorical = () => req<Historical>("/api/historical");
