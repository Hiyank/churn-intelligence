# CHURN INTELLIGENCE

An end-to-end customer churn prediction project. A scikit-learn Random Forest model is served through a FastAPI backend, and a React + TypeScript dashboard scores customers in real time with a risk gauge, retention recommendations, live analytics and assessment history.

## Why this project

Winning a new customer usually costs more than keeping an existing one, yet many teams only find out a customer is leaving after they have gone. A churn model can flag the risk earlier, but a model on its own is a file that only a data scientist can use.

CHURN INTELLIGENCE turns the model into a tool that anyone on a customer team can use. You enter a customer's details and the dashboard answers three questions straight away: how likely is this customer to leave, how serious is that risk, and what should we do about it.

## How it makes a difference

- **Earlier action:** it flags at-risk customers before they cancel, which gives the team time to step in.
- **Clear priorities:** Low, Medium and High risk levels, each with a recommended action, show where to spend limited retention effort first.
- **No technical skills needed:** the gauge, the probability and the plain-language recommendation sit together on one screen, so non-technical users can read the result.
- **Context for every prediction:** charts compare the predictions with the real churn patterns in the dataset, across subscription type, contract length, payment delay, support calls and usage.
- **Works for batches of customers:** assess many customers in one session, and the KPIs, charts and history update as you go.
- **Built to be reused:** the model, API and interface are separate, so the model can be retrained or the frontend replaced without rewriting the rest.

## Features

- **Live prediction:** enter a customer profile and get the churn probability, a Churn / No Churn decision and a risk level on one screen.
- **Risk gauge:** an animated speedometer that moves from green to orange to red. High-risk customers are highlighted.
- **Risk levels:** Low (below 30%), Medium (30% to 60%), High (60% and above), each with a recommended action.
- **Live analytics:** KPI cards and charts for risk distribution, predicted churn vs no churn, and churn by subscription type, contract length, payment delay, support calls and usage frequency.
- **Dataset vs session:** charts compare actual churn in the dataset with the predicted churn from the customers you assess in the app.
- **Assessment history:** assess as many customers as you like without refreshing the page.
- 
#Here are the screenshots of the USER INTERFACE to predict the Churn Probability
<img width="935" height="535" alt="Screenshot 2026-10-07 184046" src="https://github.com/user-attachments/assets/3a57788b-65b0-4624-9756-6ceb4081601a" />

<img width="926" height="455" alt="Screenshot 2026-10-07 184057" src="https://github.com/user-attachments/assets/783d9aad-e440-46dd-8c93-fbed9d1a8964" />

<img width="935" height="463" alt="Screenshot 2026-10-07 184111" src="https://github.com/user-attachments/assets/7fa6cb27-7bb7-4f18-9163-b7f97561b42e" />

## Tech stack

| Layer -> Tools 
1. Model -> Python, pandas, scikit-learn (Random Forest) 
2. Backend -> FastAPI, Uvicorn
3. Frontend -> React, TypeScript, Vite, Tailwind CSS, Recharts, Lucide

## Project structure

```
churn/
  backend/        FastAPI app (main.py) and requirements.txt
  frontend/       React + TypeScript dashboard
  src/            train.py, predict.py, preprocessing.py
  data/           churn_set.csv
  notebooks/      data exploration notebook
  models/         churn_model.pkl, preprocessor.pkl (created by train.py)
```

## Model inputs

Age, Tenure, Usage Frequency, Support Calls, Payment Delay, Total Spend, Gender, Subscription Type, Contract Length. The target is `Churn` (0 or 1).

## Getting started

### 1. Clone the repo

```
git clone https://github.com/Hiyank/churn-intelligence.git
cd churn-intelligence
```

### 2. Install the backend

```
pip install -r backend/requirements.txt
```

### 3. Train the model

The trained model files are not stored in this repo. Place your dataset at `data/churn_set.csv` (it needs a `Churn` column with 0 / 1 values), then run from the project root:

```
python src/train.py
```

This creates `models/churn_model.pkl` and `models/preprocessor.pkl`.

### 4. Start the backend

From the project root:

```
python -m uvicorn backend.main:app --reload --port 8000
```

Check that it is ready at http://127.0.0.1:8000/api/health. You should see `{"model": true, "dataset": true}`.

### 5. Start the frontend

In a second terminal:

```
cd frontend
npm install
npm run dev
```

Open http://localhost:5173.

## API

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/predict` | Returns churn probability, prediction, risk level and recommendation for one customer |
| GET | `/api/historical` | Actual churn rate and churn breakdowns computed from the dataset |
| GET | `/api/health` | Reports whether the model files and dataset were found |

Example request body for `/api/predict`:

```json
{
  "age": 45,
  "tenure": 5,
  "usage_frequency": 4,
  "support_calls": 9,
  "payment_delay": 28,
  "total_spend": 300,
  "gender": "Male",
  "subscription_type": "Basic",
  "contract_length": "Monthly"
}
```

## Notes

- Always run the backend from the project root, because the model and data paths are relative to it.
- The saved model only loads with a compatible scikit-learn version. If you see a loading error, re-run `python src/train.py` with your installed version.
- Assessment history is kept in the browser tab and resets when the page is refreshed.
- Paths can be overridden with the `CHURN_MODEL_PATH`, `CHURN_PREPROCESSOR_PATH` and `CHURN_DATA_PATH` environment variables.
