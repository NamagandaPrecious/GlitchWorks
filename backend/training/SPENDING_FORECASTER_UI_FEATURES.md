# How the Spending Forecaster Uses the Features on the Flux Pod Card

This document explains how the **spending forecaster** uses the features visible on the Entertainment pod card (category, total budget, spent, remaining, time left, status, AI) to produce its outputs.

---

## 1. What the card shows (features from the screenshot)

| On-screen | Value (example) | Role for the forecaster |
|-----------|------------------|---------------------------|
| **Category** | Entertainment | Identifies which budget pod and which history to use. |
| **Total budget** | USH 30,000 | The allocated amount for the period (`pod.allocated`). |
| **Spent** | USH 5,400 | How much has already been used (`pod.spent` or effective spent). |
| **Remaining** | USH 24,600 | Derived as **Total budget − Spent** (not a separate input). |
| **Time left** | 60d left | **Output** of the forecaster: estimated days until budget runs out. |
| **Status** | Healthy | User-facing status (healthy / Strained / critical); can be aligned with forecaster risk. |
| **AI** | Button | Entry point for AI-driven insights that use the forecaster. |

So the **inputs** the forecaster actually uses from this screen are: **category**, **total budget (allocated)**, and **spent**. **Remaining** is just allocated − spent. **Days left** and **risk** (which can drive status) are **outputs** of the forecaster.

---

## 2. How the forecaster is called with these features

For each pod (e.g. Entertainment), the app does:

```ts
forecast = aiService.forecastSpending(
  pod.name,           // category, e.g. "Entertainment"
  pod.allocated,      // total budget, e.g. 30_000
  spent,              // current spent, e.g. 5_400
  30                  // daysInPeriod (length of budget window in days)
);
```

So from the screenshot:

- **Category** = `"Entertainment"` → used to filter **historical transactions** for that category and to pick **trained averages and seasonality** from the model artifacts.
- **Total budget** = **30,000** → `currentAllocated`; forecaster uses it to compute **remaining** and then **days until depletion**.
- **Spent** = **5,400** → `currentSpent`; forecaster uses it to get **remaining** and to blend with history when data is scarce.
- **Days in period** = **30** (in code today) → used to turn a **monthly predicted spend** into a **daily rate**, then **days until depletion**.

So the spending forecaster **does** work with the features available on that screen: **category**, **allocated**, and **spent** (and a fixed period length). The card then shows the forecaster’s **days left** (and optionally risk/status).

---

## 3. How the forecaster uses each feature internally

### 3.1 Category (e.g. "Entertainment")

- **Filters history:** Only past transactions with `category === "Entertainment"` and `type === "expense"` are used.
- **Trained model:** Reads `trainedAverages["Entertainment"]` and `trainedSeasonality["Entertainment"]` from the artifacts (trained on similar users/data). So the same category name in the UI and in training **must** match.
- **Result:** Predictions and “days left” are specific to Entertainment, not to other pods.

So the **category** on the card is the main feature that ties the card to the right history and the right trained parameters.

### 3.2 Total budget (allocated) and Spent

- **Remaining:**  
  `remaining = allocated - spent`  
  (e.g. 30,000 − 5,400 = 24,600). This is what’s left to spend.
- **Predicted monthly spend:**  
  The forecaster estimates how much will be spent per month (from history + trend + seasonality + trained averages). It then turns that into a **daily rate** (e.g. `predictedAmount / 30`).
- **Days until depletion:**  
  `daysUntilDepletion = remaining / dailySpending`  
  So with **remaining = 24,600** and a low daily rate, you get a large number of days (e.g. **60d left**). That value is what appears as **“60d left”** on the card.
- **Risk level:**  
  The forecaster sets risk (low/medium/high) using:
  - **Utilization** = spent / allocated (e.g. 5,400 / 30,000 ≈ 18%).
  - **Days until depletion** (e.g. 60).
  - Rules like: low risk if utilization &lt; 50% and days &gt; 20; high if utilization &gt; 80% or days &lt; 7.

So **total budget** and **spent** are the only two numbers from the card that drive **remaining**, **days left**, and **risk**. They are exactly the features the forecaster needs to “work with the screenshot.”

### 3.3 Time horizon (days in period)

- In the code, `daysInPeriod` is passed as **30**. That is used to:
  - Convert **predicted monthly spending** into a **daily spending rate**.
  - Compute **days until depletion** from **remaining** and that daily rate.
- So the **“60d left”** is: with **remaining** and the predicted **daily** spend, the budget would last about 60 days. If the period were different (e.g. 60 days), the same logic would apply with that period length.

So the forecaster **does** use a time-horizon feature; on the card it’s reflected in how “days left” is interpreted (e.g. “60 days at current predicted rate”).

---

## 4. How “Healthy” and the progress bar relate to these features

- **Remaining (USH 24,600)** and the **progress bar** are simple:  
  remaining = allocated − spent; bar = spent / allocated.  
  No forecaster needed for that.
- **“Healthy”** on the card is the pod’s **status** (healthy / Strained / critical). In the current app this can be stored per pod; it can be **aligned** with the forecaster’s **riskLevel** (e.g. low risk → Healthy, high → critical) so that the status reflects how the forecaster sees the pod given the same features (allocated, spent, category, history).

So in practice the spending forecaster **works with the features available in the screenshot** (category, total budget, spent, and an implicit period length) to produce:

- **Days left** (e.g. 60d),
- **Risk level** (which can drive “Healthy”),
- And internally: predicted amount, trend, confidence interval, depletion date.

---

## 5. Summary table (screenshot → forecaster)

| What you see on the card | Role for the spending forecaster |
|---------------------------|-----------------------------------|
| **Entertainment** (category) | Input: selects history and trained Entertainment averages/seasonality. |
| **USH 30,000** (total budget) | Input: `allocated`; used to compute remaining and days until depletion. |
| **USH 5,400 spent** | Input: `currentSpent`; used for remaining and for blending when history is thin. |
| **USH 24,600 remaining** | Derived: allocated − spent; used with predicted daily rate to get days left. |
| **60d left** | **Output**: days until budget depletes at predicted spending rate. |
| **Healthy** | Can be driven by forecaster’s risk level (low → Healthy). |
| **Progress bar** | From spent and allocated only; not a forecaster input. |
| **AI** | Uses forecaster (and possibly other models) for insights and suggestions. |

So: **the spending forecaster is designed to work with exactly the features available on that screenshot** (category, total budget, spent, and period length), and it produces the “days left” (and risk) that the card can show. The only thing not visible on the card is **historical transactions** for that category, which the forecaster also uses to improve the prediction.
