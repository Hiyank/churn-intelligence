import pandas as pd
import joblib

# Load trained model and preprocessor
model = joblib.load("models/churn_model.pkl")
preprocessor = joblib.load("models/preprocessor.pkl")

print("Model and preprocessor loaded successfully.")

customer = pd.DataFrame([{
    "Age": 45,
    "Tenure": 5,
    "Payment Delay": 28,
    "Usage Frequency": 4,
    "Gender": "Male",
    "Support Calls": 9,
    "Subscription Type": "Basic",
    "Contract Length": "Monthly",
    "Total Spend": 300
}])

print("\nCustomer data:")
print(customer)

customer_processed = preprocessor.transform(customer)

print("\nProcessed customer shape:")
print(customer_processed.shape)

# Make churn prediction
prediction = model.predict(customer_processed)[0]

# Get probability of churn
churn_probability = model.predict_proba(customer_processed)[0][1]

print("\nPrediction:", "Churn" if prediction == 1 else "No Churn")
print("Churn Probability:", round(churn_probability * 100, 2), "%")

if churn_probability < 0.30:
    risk_level = "Low"
elif churn_probability < 0.60:
    risk_level = "Medium"
else:
    risk_level = "High"

print("Risk Level:", risk_level)

if risk_level == "High":
    recommendation = "Immediate retention intervention recommended."
elif risk_level == "Medium":
    recommendation = "Monitor customer and consider a retention offer."
else:
    recommendation = "No immediate intervention required."

print("Recommendation:", recommendation)