# Training Outcomes and How They Impact Model Performance

This document explains what the training pipeline produces, what the reported metrics mean, and how those outcomes affect each model’s behaviour in the app.

---

## 1. What the training produces

When you run `python training/train_models.py --model all`, the pipeline:

1. **Builds datasets** from the configured Kaggle sources (transactions, spending time series, budget shares, goal/savings data).
2. **Trains** each model type and writes **artifacts** (TypeScript constants) under `src/lib/ai/models/artifacts/`.
3. **Evaluates** on held-out data and writes **metrics** to `training/reports/latest.json`.
4. **Generates** a visual report at `training/reports/training_report.html`.

So there are two kinds of “outcomes”:

- **Artifacts** = the actual model parameters the app uses at runtime.
- **Report metrics** = how well those parameters performed on the evaluation set (used to judge quality and regressions).

---

## 2. Are the artifacts merged with the general system?

**Yes.** The artifacts are part of the app build and are merged with the rest of the system as follows.

**Data flow:**

1. **Artifact files** live in `src/lib/ai/models/artifacts/` (e.g. `transaction-categorizer.ts`, `spending-forecaster.ts`).
2. **Model modules** in `src/lib/ai/models/` import those artifacts and use them at runtime:
   - **transaction-categorizer.ts** — Imports `trainedCategoryKeywords`, `trainedCategoryTokenWeights`, `trainedCategoryWeights`, `trainedCategoryPriors`. Merges trained keywords with in-code `categoryKeywords`, uses trained weights/priors as the main scoring parameters (trained token weights take precedence).
   - **spending-forecaster.ts** — Imports `trainedSeasonality` and `trainedAverages`; uses them for baseline and monthly scaling.
   - **budget-allocator.ts** — Imports `trainedBudgetShares`; uses them when suggesting allocation (e.g. when there’s no or little user history).
   - **goal-predictor.ts** — Imports `trainedSavingsRates`; uses them to pick a savings rate by income bracket.
   - **anomaly-detector.ts** — Imports `trainedCategoryStats`; uses median/percentiles per category to flag unusual amounts.
3. **AIService** (`src/lib/ai/ai-service.ts`) imports the model modules and exposes `categorizeTransaction`, `forecastSpending`, `suggestBudgetAllocation`, `predictGoal`, `detectAnomaly`.
4. **App UI** (Transactions, Goals, Dashboard, etc.) calls the AIService; so every suggestion or prediction that uses those functions is driven by the current artifacts.

So: **artifacts are the source of trained parameters**. The model code merges them with in-code defaults where relevant (e.g. categorizer keyword sets) and with user data (e.g. user history, income). When you retrain and overwrite the artifact files, the next app build uses the new parameters everywhere those models are used—no separate “deploy” step beyond rebuilding the app.

---

## 3. Outcomes by model

### 3.1 Transaction categorizer

**Artifacts** (`transaction-categorizer.ts`):

- **trainedCategoryKeywords** — For each category, a list of top tokens (e.g. Eating Out: `restaurant`, `starbucks`, `tavern`, …). Used to boost a category when the user’s description contains those words.
- **trainedCategoryTokenWeights** — TF–IDF-style scores per token per category. The app scores each category by summing these weights for tokens in the description; higher weight = stronger signal for that category.
- **trainedCategoryWeights** — Amount-based signals: `amount`, `isLarge`, `isSmall`, `isMedium`. E.g. “Income” gets a boost for large amounts; “Eating Out” for small/medium.
- **trainedCategoryPriors** — Base probability of each category (e.g. Debt Payments ~18%, Eating Out ~18%). When the user has little history, the app leans on these so the first suggestions are plausible.

**Report metrics:**

- **macro_f1 (0.73)** — Average F1 across categories (each category weighted equally). Higher = better balance; no single category dominates.
- **top3_accuracy (0.84)** — Share of test samples where the true category is in the model’s top-3 suggestions. Directly reflects how often “suggested categories” in Quick Entry will contain the right one.
- **weighted_f1 (0.78)** — F1 weighted by category frequency. Reflects accuracy on the most common categories (Debt, Eating Out, Food, etc.).
- **confusion_matrix** — Rows = true category, columns = predicted. Diagonal = correct; off-diagonal = confusions (e.g. Communication → Debt Payments, Transport/Utilities → Debt Payments).

**Impact on app:**

- Better token weights and priors → more accurate **Quick Entry** and **Add transaction** suggestions.
- Higher macro_f1 → suggestions are good across all categories, not only the frequent ones.
- Higher top3_accuracy → the correct category appears in the top 3 more often, so users find it without scrolling.

---

### 3.2 Spending forecaster

**Artifacts** (`spending-forecaster.ts`):

- **trainedSeasonality** — Per category, a multiplier per month (1–12). E.g. “Shopping” might be 2.25× in September, 0.59× in August. Used to scale a baseline by month.
- **trainedAverages** — Per category, a baseline daily average (scaled to ~30 days). Forecast = baseline × seasonal factor for that month.

**Report metrics:**

- **mape (12.7%)** — Mean absolute percentage error of forecasts vs actuals. Lower = smaller % error on average.
- **mae (431)** — Mean absolute error in currency units. Depends on your data scale; useful to see if forecasts are in the right ballpark.
- **directional_accuracy (0.52)** — How often the forecast correctly predicts “up” or “down” vs previous period. ~0.5 = little better than chance; improvement here would need more history or features.

**Impact on app:**

- Better seasonality and averages → “Expected spending” and trend indicators per category are closer to reality.
- Lower MAPE/MAE → users can trust the numbers more for planning; high MAPE would mean forecasts are often off by a large %.

---

### 3.3 Budget allocator

**Artifacts** (`budget-allocator.ts`):

- **trainedBudgetShares** — Recommended share of total budget per category (e.g. Rent 29%, Food 18%, Savings 16%). The app uses these to suggest how to split “available budget” across categories.

**Report metrics:**

- **rmse (0.037)** — Root mean squared error between recommended shares and actual shares in the test set. Lower = suggested splits are closer to what the data shows people do.

**Impact on app:**

- Lower RMSE → “Suggest allocation” and pod suggestions align better with realistic budget splits; users get a sane starting point (e.g. not 80% on one category).

---

### 3.4 Goal predictor

**Artifacts** (`goal-predictor.ts`):

- **trainedSavingsRates** — By income bracket (`<20k`, `20-50k`, …, `500k+`), the typical desired savings rate (e.g. 0.07–0.20). Used to estimate “how much people in this bracket aim to save.”

**Report metrics:**

- **brier (0.0004)** — Accuracy of predicted probability (squared error); very low = predictions are well calibrated.
- **mae (0.017)** — Mean absolute error of predicted vs actual savings rate (e.g. 0.02 = 2 percentage points). Low = bracket-based suggestion is close to what the data shows.

**Impact on app:**

- Better rates and lower MAE → goal “achievement” or “savings rate” suggestions by income bracket are more realistic and trustworthy.

---

### 3.5 Anomaly detector

**Artifacts** (`anomaly-detector.ts`):

- **trainedCategoryStats** — Per category: median amount, MAD, and percentiles (p90, p95, p97, p98, p99, p995). The app flags a transaction as anomalous if its amount is above a chosen percentile (e.g. p95) for that category.

**Report metrics:**

- **precision (0.39)** — Of all transactions flagged as anomalies, the share that are “true” anomalies (in the evaluation setup). Higher = fewer false alarms.
- **recall (1.0)** — Share of true anomalies that were flagged. 1.0 = we catch all anomalies in the test design; the trade-off is more false positives.
- **alert_rate (0.062)** — Share of transactions that get flagged. Lower = fewer alerts; together with precision it shows how “noisy” the alerts are.

**Impact on app:**

- Stats (percentiles) define **when** a transaction is marked “unusual.” Tighter percentiles → fewer but more severe alerts; looser → more alerts, more false positives.
- Higher precision at a given alert_rate → users see fewer irrelevant “anomaly” warnings.

---

## 3. How the report metrics relate to app behaviour

- **Transaction categorizer:** macro_f1, top3_accuracy, and the confusion matrix directly predict Quick Entry and categorisation quality. Improving these metrics improves suggestion quality.
- **Spending forecaster:** MAPE and MAE predict how accurate the in-app forecasts and trends will be; directional_accuracy indicates how useful “up/down” signals are.
- **Budget allocator:** RMSE predicts how good “suggested” budget splits are; lower RMSE = more realistic suggestions.
- **Goal predictor:** Brier and MAE predict how good savings-rate / goal-achievement suggestions are by income bracket.
- **Anomaly detector:** Precision and alert_rate predict how often users see useful vs irrelevant “unusual transaction” alerts.

The **filters** in the report (e.g. `min_category_count`, `max_category_count`, `allowed_categories`) describe the data shape the models were trained on. Changing these in `train_models.py` and retraining will change both the artifacts and the metrics, and therefore app behaviour.

---

## 5. Summary table

| Model                  | Main artifacts                          | Metrics that matter for the app           |
|------------------------|-----------------------------------------|-------------------------------------------|
| Transaction categorizer| Keywords, token weights, priors, amount | macro_f1, top3_accuracy, confusion matrix |
| Spending forecaster    | Seasonality, averages                   | MAPE, MAE                                 |
| Budget allocator       | Budget shares                           | RMSE                                      |
| Goal predictor         | Savings rates by bracket               | Brier, MAE                                |
| Anomaly detector       | Category stats (percentiles)           | Precision, alert_rate, recall             |

Training outcomes = **artifacts** (what the app uses) + **report metrics** (how good those artifacts are). Better metrics mean better real-world performance for the features that rely on each model.
