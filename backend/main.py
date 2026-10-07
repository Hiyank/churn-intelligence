"""FastAPI wrapper around the existing churn model. No retraining, no invented data."""
import os
from functools import lru_cache
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

ROOT = Path(__file__).resolve().parent.parent
MODEL_PATH = Path(os.getenv("CHURN_MODEL_PATH", ROOT / "models" / "churn_model.pkl"))
PREPROCESSOR_PATH = Path(os.getenv("CHURN_PREPROCESSOR_PATH", ROOT / "models" / "preprocessor.pkl"))
DATA_PATH = os.getenv("CHURN_DATA_PATH")  # optional; otherwise first CSV in ./data
TARGET = "Churn"

app = FastAPI(title="Churn Intelligence API")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
                   allow_methods=["*"], allow_headers=["*"])


class Customer(BaseModel):
    age: int = Field(ge=18, le=100)
    tenure: int = Field(ge=0, le=100)
    usage_frequency: int = Field(ge=0, le=100)
    support_calls: int = Field(ge=0, le=100)
    payment_delay: int = Field(ge=0, le=100)
    total_spend: float = Field(ge=0, le=1_000_000)
    gender: str
    subscription_type: str
    contract_length: str


@lru_cache(maxsize=1)
def artifacts():
    try:
        return joblib.load(MODEL_PATH), joblib.load(PREPROCESSOR_PATH)
    except Exception as e:
        raise HTTPException(503, f"Could not load model files ({MODEL_PATH.name}, {PREPROCESSOR_PATH.name}): {e}")


def risk_of(p: float):
    if p < 30:
        return "LOW", "No immediate intervention required."
    if p < 60:
        return "MEDIUM", "Monitor customer and consider a retention offer."
    return "HIGH", "Immediate retention intervention recommended."


@app.post("/api/predict")
def predict(c: Customer):
    model, pre = artifacts()
    row = pd.DataFrame([{
        "Age": c.age, "Tenure": c.tenure, "Payment Delay": c.payment_delay,
        "Usage Frequency": c.usage_frequency, "Gender": c.gender, "Support Calls": c.support_calls,
        "Subscription Type": c.subscription_type, "Contract Length": c.contract_length,
        "Total Spend": c.total_spend}])
    try:
        x = pre.transform(row)
        prob = float(model.predict_proba(x)[0, 1]) * 100
        pred = int(model.predict(x)[0])
    except Exception as e:
        raise HTTPException(422, f"Model could not score this customer: {e}")
    risk, reco = risk_of(prob)
    return {"probability": round(prob, 2), "prediction": pred, "risk": risk, "recommendation": reco}


def find_dataset():
    if DATA_PATH:
        return Path(DATA_PATH)
    default = ROOT / "data" / "churn_set.csv"  # same path train.py uses
    if default.exists():
        return default
    files = sorted((ROOT / "data").glob("*.csv"))
    return files[0] if files else None


def numeric_bins(df, col, y, q=5):
    cats, edges = pd.qcut(df[col], q, duplicates="drop", retbins=True)
    codes, out, prev = cats.cat.codes, [], None
    for i in range(len(edges) - 1):
        hi = int(np.floor(edges[i + 1]))
        lo = int(np.floor(edges[i])) if i == 0 else prev + 1
        prev = hi
        m = codes == i
        if lo > hi or not m.any():
            continue
        out.append({"label": str(lo) if lo == hi else f"{lo}–{hi}", "hi": hi,
                    "rate": round(float(y[m].mean()) * 100, 1), "count": int(m.sum())})
    return out


def categorical(df, col, y, order):
    g = pd.DataFrame({"k": df[col].astype(str), "y": y}).groupby("k")["y"].agg(["mean", "count"])
    keys = [k for k in order if k in g.index] + [k for k in g.index if k not in order]
    return [{"label": k, "rate": round(float(g.loc[k, "mean"]) * 100, 1), "count": int(g.loc[k, "count"])} for k in keys]


@lru_cache(maxsize=1)
def historical_stats():
    path = find_dataset()
    if not path or not path.exists():
        raise HTTPException(404, "Dataset not found. Put your CSV in ./data or set CHURN_DATA_PATH.")
    df = pd.read_csv(path)
    need = ["Subscription Type", "Contract Length", "Payment Delay", "Support Calls", "Usage Frequency", TARGET]
    miss = [c for c in need if c not in df.columns]
    if miss:
        raise HTTPException(422, f"Dataset is missing columns: {miss}")
    df = df.dropna(subset=need)
    y = pd.to_numeric(df[TARGET], errors="coerce")
    if y.isna().any():
        y = df[TARGET].astype(str).str.lower().map({"yes": 1, "no": 0, "true": 1, "false": 0, "1": 1, "0": 0})
    ok = y.notna()
    df, y = df[ok], y[ok].astype(float)
    return {"total": int(len(df)), "churn_rate": round(float(y.mean()) * 100, 1), "breakdowns": {
        "subscription_type": categorical(df, "Subscription Type", y, ["Basic", "Standard", "Premium"]),
        "contract_length": categorical(df, "Contract Length", y, ["Monthly", "Quarterly", "Annual"]),
        "payment_delay": numeric_bins(df, "Payment Delay", y),
        "support_calls": numeric_bins(df, "Support Calls", y),
        "usage_frequency": numeric_bins(df, "Usage Frequency", y)}}


@app.get("/api/historical")
def historical():
    return historical_stats()


@app.get("/api/health")
def health():
    ds = find_dataset()
    return {"model": MODEL_PATH.exists() and PREPROCESSOR_PATH.exists(), "dataset": bool(ds and ds.exists())}
