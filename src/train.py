import pandas as pd

from sklearn.model_selection import train_test_split

from preprocessing import create_preprocessor


# Load data
df = pd.read_csv("data/churn_set.csv")

print("Dataset loaded:", df.shape)


# Features and target
features = [
    "Age",
    "Tenure",
    "Usage Frequency",
    "Support Calls",
    "Payment Delay",
    "Gender",
    "Subscription Type",
    "Contract Length",
    "Total Spend"
]

X = df[features]
y = df["Churn"]


print("Features:", X.shape)
print("Target:", y.shape)

from sklearn.model_selection import train_test_split

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

print("Training set:", X_train.shape)
print("Testing set:", X_test.shape)

# Create preprocessing pipeline
preprocessor = create_preprocessor()

# Fit preprocessing only on training data
X_train_processed = preprocessor.fit_transform(X_train)

# Apply the same preprocessing to test data
X_test_processed = preprocessor.transform(X_test)

print("Processed training data:", X_train_processed.shape)
print("Processed testing data:", X_test_processed.shape)

from sklearn.ensemble import RandomForestClassifier

# Create Random Forest model
rf_model = RandomForestClassifier(
    n_estimators=200,
    random_state=42,
    n_jobs=-1
)

# Train the model
rf_model.fit(X_train_processed, y_train)

print("Random Forest training completed.")

y_pred = rf_model.predict(X_test_processed)

print("Predictions generated.")

from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

accuracy = accuracy_score(y_test, y_pred)

print("\nRandom Forest Accuracy:", round(accuracy, 4))

print("\nClassification Report:")
print(classification_report(y_test, y_pred))

print("\nConfusion Matrix:")
print(confusion_matrix(y_test, y_pred))

import joblib
import os

os.makedirs("models", exist_ok=True)

joblib.dump(rf_model, "models/churn_model.pkl")
joblib.dump(preprocessor, "models/preprocessor.pkl")

print("\nModel saved successfully.")
print("Preprocessor saved successfully.")