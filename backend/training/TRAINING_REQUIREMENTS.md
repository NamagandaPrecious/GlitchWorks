# Training Requirements — UniGuard Wallet AI Models

This document describes the **algorithms**, **software dependencies**, **data requirements**, and **environment** needed to successfully train all five models.

---

## 1. Software Dependencies

### 1.1 Python version

- **Python 3.9+** (3.10 or 3.11 recommended).

### 1.2 Core packages (required)

| Package   | Purpose |
|----------|--------|
| **numpy** | Numerics: percentiles, median, MAD, mean; array operations. |
| **pandas** | DataFrames, CSV/Excel read, datetime, groupby, time/random splits. |

### 1.3 Optional packages

| Package     | Purpose |
|------------|--------|
| **kagglehub** | Download Kaggle datasets when using the pipeline/notebooks “download” step. Without it, you must place datasets manually and set `datasets_manifest.json` (or `DEFAULT_DATASET_PATHS` in code). |
| **openpyxl** | Reading `.xlsx` / `.xls` files if any dataset is Excel (used by `safe_read_table` in `train_models.py`). |

### 1.4 Install

```bash
cd backend/training
pip install -r requirements.txt
# If you use Kaggle download step:
pip install kagglehub
# If you have Excel datasets:
pip install openpyxl
```

---

## 2. Algorithms Used by Each Model

Training is **deterministic and rule-based** (no stochastic optimizers). The same data and code produce the same artifacts.

### 2.1 Transaction categorizer

- **Input:** Table with columns: `date`, `description`, `amount`, `category` (and optional `type`).
- **Algorithm:**
  - **Tokenization:** Lowercase, remove non-alphanumeric, split on spaces; drop stopwords and tokens with digits; word length > 2.
  - **N-grams:** Bigrams added (e.g. `coffee_shop`).
  - **Token weights:** TF–IDF style: per-category term frequency × inverse document frequency across categories; top tokens per category; generic and strong-token rules.
  - **Amount features:** Per-category mean amount; binary flags: isLarge / isSmall / isMedium (thresholds relative to 1k / 10k).
  - **Priors:** Category relative frequency from training set.
  - **Inference (evaluation):** Score = prior × product of token weights and amount weights; predict argmax; top‑3 = top 3 by score.
- **Output:** `trainedCategoryKeywords`, `trainedCategoryTokenWeights`, `trainedCategoryWeights`, `trainedCategoryPriors` (TypeScript artifact).
- **Evaluation metrics:** Macro F1, weighted F1, top‑3 accuracy, confusion matrix.

### 2.2 Spending forecaster

- **Input:** Table with `date`, `amount`, `category` (and optional `description`); used as monthly time series per category.
- **Algorithm:**
  - **Per category:** Mean daily spend × 30 → `trainedAverages`; monthly mean / overall mean → `trainedSeasonality` (month 1–12).
  - **Forecast:** For a month, prediction = `trainedAverages[cat] * trainedSeasonality[cat][month]`.
- **Output:** `trainedSeasonality`, `trainedAverages` (TypeScript artifact).
- **Evaluation metrics:** MAE, MAPE, directional accuracy (up/down vs previous month).

### 2.3 Budget allocator

- **Input:** Budget-allocation datasets (columns like `*Budget`) and/or spending-habits CSV with category columns (e.g. Rent, Groceries).
- **Algorithm:**
  - For each row, compute total across budget/spend columns; category share = column value / total.
  - Average share per category across all rows → `trainedBudgetShares`.
- **Output:** `trainedBudgetShares` (TypeScript artifact).
- **Evaluation metrics:** RMSE of predicted vs actual shares on a random 20% holdout.

### 2.4 Goal predictor

- **Input:** Table with `Income` and `Desired_Savings_Percentage` (or similar).
- **Algorithm:**
  - Income brackets: `<20k`, `20-50k`, `50-100k`, `100-200k`, `200-500k`, `500k+`.
  - Per bracket: mean of desired savings percentage → `trainedSavingsRates`.
  - Prediction = rate for the user’s income bracket.
- **Output:** `trainedSavingsRates` (TypeScript artifact).
- **Evaluation metrics:** Brier score (MSE of probability), MAE of savings rate.

### 2.5 Anomaly detector

- **Input:** Same transaction table as categorizer: `date`, `description`, `amount`, `category`.
- **Algorithm:**
  - Per category: median amount, MAD, percentiles (p90, p95, p97, p98, p99, p99.5).
  - Anomaly = amount above a chosen percentile (e.g. 95th) or median + k×MAD.
- **Output:** `trainedCategoryStats` (median, mad, p90–p99.5, count) (TypeScript artifact).
- **Evaluation metrics:** Precision, recall, alert rate on a time-based test split.

---

## 3. Data Requirements

### 3.1 Dataset sources (Kaggle)

Defined in `backend/training/models/<model>/datasets.json` as `kaggle_datasets`. Examples:

- **Transaction categorizer / Anomaly:**  
  `entrepreneurlife/personal-finance`, `bukolafatunde/personal-finance`, `willianoliveiragibin/financial-wellness`
- **Spending forecaster:**  
  `ismetsemedov/personal-budget-transactions-dataset`, `mohammedarfathr/budgetwise-personal-finance-dataset`, `cihannl/budgetwise-personal-finance-dataset`, `thedevastator/analyzing-credit-card-spending-habits-in-india`
- **Budget allocator / Goal predictor:**  
  `shrinolo/budget-allocation`, `shriyashjagtap/indian-personal-finance-and-spending-habits`

Column mapping per source is hardcoded in `train_models.py` (`build_transaction_dataset` / `build_spending_dataset` / etc.). Your CSV or Excel must have columns that map to the expected names (e.g. date, description, amount, category).

### 3.2 Transaction / spending data (categorizer, forecaster, anomaly)

- **Required columns:** `date`, `description`, `amount`, `category`.
- **Filters:**
  - `amount` in [MIN_AMOUNT, MAX_AMOUNT] (e.g. 1 to 5e9).
  - `category` in `ALLOWED_CATEGORIES` (normalized via `CATEGORY_ALIASES`).
  - Description: English-like (e.g. ≥90% ASCII), token count ≥ MIN_DESC_TOKENS (e.g. 1).
- **Balancing (categorizer):** Categories with count &lt; MIN_CATEGORY_COUNT (e.g. 55) dropped; categories capped at MAX_CATEGORY_COUNT (e.g. 400) by subsampling.
- **Spending forecaster:** Category must appear in ≥ MIN_SPENDING_CATEGORY_COUNT rows and in ≥ MIN_SPENDING_MONTHS months (e.g. 80 rows, 6 months).

### 3.3 Budget / goal data

- **Budget:** Tables with columns ending in `Budget` or named category columns; each row = one budget; shares = column / row total.
- **Goal:** Table with income and desired savings percentage; income bracket boundaries fixed in code (e.g. 20k, 50k, 100k, 200k, 500k).

---

## 4. Environment and Paths

- **Repo layout:** Scripts assume project root is two levels above `backend/training` (so `backend/training/train_models.py` and `backend/training/pipeline.py` can find `frontend/src/lib/ai/models/artifacts` and `backend/training/reports`).
- **Artifacts:** Written to `frontend/src/lib/ai/models/artifacts/*.ts`.
- **Reports:** `backend/training/reports/latest.json` and `training_report.html` (when running `--model all`).
- **Manifest:** `backend/training/data/datasets_manifest.json` (filled by pipeline download or manually) maps Kaggle dataset names to local paths. `train_models.resolve_dataset_paths()` uses this or falls back to `DEFAULT_DATASET_PATHS` (which point to `~/.cache/kagglehub/...` if you used kagglehub).

---

## 5. Summary Checklist for Successful Training

| Requirement | Detail |
|-------------|--------|
| Python | 3.9+ |
| Core libs | `numpy`, `pandas` |
| Download datasets | `kagglehub` (or manual manifest + paths) |
| Excel support | `openpyxl` if any `.xlsx`/`.xls` |
| Data | Correct column names and mappings; meet min rows/months and category/amount filters |
| Algorithms | Tokenization + TF‑IDF + priors (categorizer); means/seasonality (forecaster); mean shares (allocator); bracket means (goal); percentiles/MAD (anomaly) |
| Output | TS artifacts in `frontend/.../artifacts/`; optional JSON/HTML report for `--model all` |

Using the **notebooks** in `notebooks/` (with `sys.path` set to `backend`) satisfies the same requirements: same algorithms, same data, same artifact paths.
