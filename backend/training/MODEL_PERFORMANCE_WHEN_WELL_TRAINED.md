# Model Performance When Well Trained

This document describes **what “well trained” means** for each of the five UniGuard models (metric targets) and **how that performance shows up** in the app for the user.

---

## 1. Transaction categorizer

### When well trained

| Metric | Target (minimum) | Meaning |
|--------|------------------|--------|
| **Macro F1** | ≥ 0.35 | Average F1 across categories (no single category dominates the score). Higher = more balanced accuracy. |
| **Top-3 accuracy** | ≥ 0.70 | For 70%+ of transactions, the true category is in the model’s top 3 guesses. User can pick the right one even when the top guess is wrong. |

Well-trained behaviour: **correct category is often #1**, and when it isn’t, it usually appears in the **top 3** so the user can select it quickly.

### How it carries out in the app

- **Transactions page:** When the user adds a transaction (description + amount), the app calls `aiService.categorizeTransaction()`. With a well-trained model:
  - **Suggested category** is right most of the time.
  - **Alternatives** (top 3) usually contain the true category, so manual correction is one click.
- **Bulk / import:** Same logic; fewer wrong buckets and less manual recategorisation.
- **Reports & Flux Pods:** Spending is attributed to the right categories, so breakdowns and pod usage reflect reality.

---

## 2. Spending forecaster

### When well trained

| Metric | Target | Meaning |
|--------|--------|--------|
| **MAPE** | ≤ 35% | Mean absolute percentage error of predicted vs actual spend. Lower = forecasts closer to what actually happens. |
| **MAE** | (monitor) | Mean absolute error in currency units; useful for interpreting “how many dollars off” on average. |
| **Directional accuracy** | (higher is better) | % of months where the model correctly predicts “spend more” or “spend less” vs previous month. |

Well-trained behaviour: **forecasts are within a reasonable band** of actual spend (e.g. often within 20–35% in relative terms), and **direction** (up/down) is right more often than wrong.

### How it carries out in the app

- **Flux Pods:** For each pod (category), the app calls `aiService.forecastSpending(category, allocated, spent, daysInPeriod)`. With a well-trained model:
  - **“Will you run out?”** – Forecast of spend by end of period is plausible; user gets useful “on track” vs “likely over” signals.
  - **“Projected spend”** – The number shown is close enough to reality to guide budgeting decisions.
- **Reports / insights:** Any “expected spend” or “trend” based on this forecaster reflects actual behaviour better, so advice is more trustworthy.

---

## 3. Budget allocator

### When well trained

| Metric | Target | Meaning |
|--------|--------|--------|
| **RMSE** | ≤ 0.05 | Root mean squared error of predicted vs actual **shares** (0–1 per category). Low RMSE = suggested split is close to what real budgets look like. |

Well-trained behaviour: **Suggested percentages per category** (e.g. 30% Rent, 15% Food) are in line with typical user budgets, so the initial suggestion is usable with small tweaks.

### How it carries out in the app

- **AI Companion / Flux Pods:** When the user asks for allocation advice or sets up pods, the app uses `aiService.suggestBudgetAllocation()` and `suggestNewPodAllocation()`. With a well-trained model:
  - **First-time setup:** Suggested split (e.g. “Rent 30%, Food 20%, Transport 15%…”) is realistic; user adjusts less.
  - **New pod:** Suggested amount for a new category is proportional to what similar users allocate, so it feels “in the right ballpark”.
- **Onboarding / guidance:** Any “recommended budget” or “typical allocation” copy is backed by data that matches real behaviour.

---

## 4. Goal predictor

### When well trained

| Metric | Target | Meaning |
|--------|--------|--------|
| **Brier score** | ≤ 0.02 | MSE of predicted vs actual “probability of success” (or savings rate as probability). Lower = more accurate likelihoods. |
| **MAE** | ≤ 0.05 | Mean absolute error of predicted vs actual savings rate (e.g. 0.05 = 5 percentage points). User sees “realistic” timelines. |

Well-trained behaviour: **“Will I reach this goal?”** and **“How much to save?”** are based on plausible rates; predicted dates and suggested contributions are achievable rather than off by a lot.

### How it carries out in the app

- **Goals page:** The app uses `aiService.predictGoal(goal, …)` (via `predictGoalAchievement`). With a well-trained model:
  - **Likelihood / progress:** “X% chance to reach goal by date” and progress bars reflect realistic odds.
  - **Suggested monthly contribution:** Amount or % suggested is in line with what similar users actually save, so goals feel attainable.
- **Companion / insights:** Any “you’re on track” or “consider saving more” is based on predictions that match real outcomes.

---

## 5. Anomaly detector

### When well trained

| Metric | Target | Meaning |
|--------|--------|--------|
| **Precision** | ≥ 0.25 | Of all transactions flagged as anomalies, at least ~25% are truly unusual. Reduces “cry wolf” alerts. |
| **Recall** | ≥ 0.45 | At least ~45% of real anomalies are caught. User doesn’t miss too many odd transactions. |
| **Alert rate** | ≤ 0.10 | At most ~10% of transactions are flagged. Alerts stay manageable and not noisy. |

Well-trained behaviour: **Most real anomalies are caught**, **few alerts are false**, and **alert volume** is low enough that the user pays attention (e.g. a handful per month, not dozens).

### How it carries out in the app

- **Transactions / Notifications:** When a transaction is added or synced, the app can call `aiService.detectAnomaly(transaction)`. With a well-trained model:
  - **In-app alerts:** Only genuinely unusual transactions (e.g. very high amount for that category) trigger an alert; user learns to trust the notification.
  - **Email / push (if enabled):** Same logic; “Unusual spend in Food” is actionable and not spam.
- **Peace of mind:** User knows the app will surface real outliers (e.g. duplicate charge, fraud, mistake) without flooding them with false positives.

---

## 6. Summary table: targets and where it shows up

| Model | Main targets | Where performance shows up in the app |
|-------|----------------|--------------------------------------|
| **Transaction categorizer** | Macro F1 ≥ 0.35, Top-3 ≥ 0.70 | Transactions: correct suggested category; fewer manual fixes; accurate reports & pods. |
| **Spending forecaster** | MAPE ≤ 35% | Flux Pods: realistic “on track” / “likely over”; useful projected spend. |
| **Budget allocator** | RMSE ≤ 0.05 | Companion / Pods: realistic suggested % split and new-pod amounts. |
| **Goal predictor** | Brier ≤ 0.02, MAE ≤ 0.05 | Goals: plausible “chance to reach goal” and suggested monthly contribution. |
| **Anomaly detector** | Precision ≥ 0.25, Recall ≥ 0.45, Alert rate ≤ 0.10 | Transactions / Notifications: trusted “unusual spend” alerts without spam. |

When these models are **well trained** (meeting or beating these targets on your real or holdout data), the app **carries out** that performance as: fewer wrong categories, better forecasts and budget suggestions, realistic goal predictions, and anomaly alerts that are both meaningful and rare enough to act on.
