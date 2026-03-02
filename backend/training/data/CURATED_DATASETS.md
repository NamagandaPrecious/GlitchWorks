# Curated Kaggle Datasets for AI Model Training

This document records which Kaggle datasets are used for each model and why each is considered clean (English descriptions, clear currency/amounts, consistent schema).

## Transaction categorizer & anomaly detector

- **entrepreneurlife/personal-finance**  
  Personal transactions with Date, Description, Amount, Category, Transaction Type. English descriptions; numeric amounts; consistent categories. Used for categorization and anomaly baselines.

- **bukolafatunde/personal-finance**  
  personal_transactions.csv with same column semantics. English; clear amounts and categories.

- **willianoliveiragibin/financial-wellness**  
  personal_transactions new.csv with Date, Description, Amount, Category, Transaction Type. English descriptions; numeric amounts; suitable for merging with the above.

**Why clean:** All three provide (date, description, amount, category) with English text and numeric amounts; no mixed scripts or ambiguous currency; schema aligned for merging.

## Spending forecaster

- **ismetsemedov/personal-budget-transactions-dataset**  
  budget_data.csv, 11 march 2025.csv, budjet (2).csv: date, category, amount. English category names; numeric amounts; multiple months for seasonality.

- **mohammedarfathr/budgetwise-personal-finance-dataset**  
  budgetwise_finance_dataset.csv: date, category, amount. Clear numeric amounts and category labels.

- **cihannl/budgetwise-personal-finance-dataset**  
  budgetwise_finance_dataset.csv: same schema as above. English categories; numeric amounts.

**Why clean:** Date/category/amount columns present; amounts are numeric; categories normalize to our allowed set; sufficient history per category for seasonal averages.

## Budget allocator

- **shrinolo/budget-allocation**  
  rural_budget_allocation_dataset.csv, urban_budget_allocation_dataset.csv. Columns like *Category*Budget with numeric shares. English labels; clear allocation proportions.

- **shriyashjagtap/indian-personal-finance-and-spending-habits**  
  data.csv with Rent, Loan_Repayment, Insurance, Groceries, Transport, etc. English column names; numeric spend amounts; used to compute share-of-total per row.

**Why clean:** Explicit budget/share columns; numeric values; column names map to our category schema via normalization.

## Goal predictor

- **shriyashjagtap/indian-personal-finance-and-spending-habits**  
  data.csv: Income, Desired_Savings_Percentage. Numeric income and percentage; used for savings-rate-by-income-bracket.

**Why clean:** Clear numeric Income and Desired_Savings_Percentage; no mixed units; suitable for bracket-based rate estimation.

## Filters applied (reproducibility)

- **Transactions:** allowed_categories, min_amount=1, max_amount=5e9, min_description_tokens=1, english_like_ratio≥0.9, min_category_count=50, max_category_count=500. Rows failing required schema (invalid date, amount, or category) are **rejected**, not coerced.
- **Spending:** same allowed_categories and amount bounds; min_spending_category_count=80, min_spending_months=6. Rows with missing/invalid date, amount, or category are **rejected**.
- **Budget/Goal:** rows with missing or invalid numeric fields (e.g. total budget ≤ 0, or missing Income/Desired_Savings_Percentage) are **rejected**.

Dataset registry: `training/train_models.py` (`DEFAULT_DATASET_PATHS`, `TRANSACTION_SOURCES`, `SPENDING_SOURCES`, `BUDGET_SOURCES`, `GOAL_SOURCES`). Overrides: `training/data/datasets_manifest.json` (optional).

## Inference validation

- **App pipeline:** `src/lib/ai/ai-service.ts` exposes `categorizeTransaction`, `forecastSpending`, `suggestBudgetAllocation`, `predictGoal`, `detectAnomaly`; all use artifacts from `src/lib/ai/models/artifacts/*`.
- **Transactions Quick Entry:** `src/pages/Transactions.tsx` (Quick Entry modal and add-transaction flow) calls `aiService.categorizeTransaction(description, amount, undefined, type)` so common phrases (e.g. "Starbucks coffee", "Uber ride", "Netflix") are categorized using trained keywords and priors from `transaction-categorizer.ts` plus user history when available. Validate by entering sample descriptions and confirming suggested category matches expectations.
