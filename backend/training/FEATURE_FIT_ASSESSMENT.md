# Feature fit assessment — Are the features right for the models?

This document answers: **Do the way the features are today favour or allow the models to do their work (as well as possible)?** Short answer: **mostly yes, with a few gaps.**

---

## 1. Overall view

- **Training (Python)** and **inference (frontend)** use the same core ideas: description + amount (+ optional merchant) for categorizer; date + amount + category for forecaster; category + amount for anomaly; budget shares for allocator; income + target for goal predictor.
- So **the features are largely fit** for the job: the right inputs are there and used in a consistent way.
- They are **not “perfect”** in the sense that a few things could be improved (see below). With those improvements, the models could do slightly better and behave more predictably.

---

## 2. Per-model assessment

### Transaction categorizer

**What the model needs:** Description (words), amount (number), and ideally merchant (who you paid).

**What you have:**

- **Description** — Used in both training and frontend. Training builds **token/keyword weights** from it; frontend uses **extractTransactionFeatures** (hasCoffee, hasShopping, hasTech, etc.) and **trained keywords + token weights** from the artifact. So description is used well and **fits** the model.
- **Amount** — Used everywhere: training has amount stats and isLarge/isSmall/isMedium; frontend has `amount`, `isLarge`, `isSmall`, `isMedium` and the artifact has `trainedCategoryWeights` with those keys. So amount **fits** the model.
- **Merchant** — Used **only at inference** (frontend): brand overrides, “Amazon + large = Tech”, and user merchant–category affinity. **Training data (Kaggle) usually has no separate merchant column**; merchant is often inside the description. So:
  - For **training**, the model already learns from description (which often contains the merchant name). So the model can still work well.
  - For **inference**, when the app has a separate merchant field, it is used and **favours** the model (extra signal).
  - **Gap:** If you had a **separate merchant column in training**, you could learn merchant–category weights explicitly and the categorizer could do even better. So features are **good but not perfect**; adding merchant to training would favour the model more.

**Verdict:** Features **do favour** the categorizer and allow it to work well. They would be **closer to perfect** if merchant were a first-class feature in training too.

---

### Spending forecaster

**What the model needs:** Past amounts per category and **dates** (to get monthly/seasonal patterns).

**What you have:** Training and frontend both use **date**, **amount**, and **category**. No extra features are needed. Dates are normalized; amounts are used for means and seasonality. So the features **fit perfectly** for what this model does.

**Verdict:** Features **are fit** to allow the forecaster to work as designed.

---

### Budget allocator

**What the model needs:** How people split their budget (category → share of total).

**What you have:** Training reads tables where each row has category-wise amounts or budget columns; shares are computed (column / total). No transaction-level features. So the features **fit** the model.

**Verdict:** Features **are fit** for the allocator.

---

### Goal predictor

**What the model needs:** Income, desired (or actual) savings rate or target; optional: current amount, monthly contribution, deadline.

**What you have:** Training uses **Income** and **Desired_Savings_Percentage** (or equivalent); frontend uses goal target, current amount, monthly contribution, deadline, and can use income for bracket. So the features **fit** the model.

**Verdict:** Features **are fit** for the goal predictor.

---

### Anomaly detector

**What the model needs:** **Amount** and **category** (and history of amounts per category to define “normal”).

**What you have:** Training and frontend both use transaction amount and category; history is used to compute per-category stats (median, MAD, percentiles). So the features **fit** the model. Correct category is important; that depends on the categorizer. So as long as categorizer output is used, features **favour** the anomaly detector.

**Verdict:** Features **are fit** for the anomaly detector.

---

## 3. Cross-cutting points

### Consistency

- **Category names** — Training uses `ALLOWED_CATEGORIES` and normalizes with `CATEGORY_ALIASES`; frontend uses the same allowed list and artifact keywords/weights. So categories are **consistent** and **favour** the models.
- **Amount** — Always numeric; training and frontend both use absolute amount and similar bands (e.g. large/small). So amount is **consistent**.
- **Dates** — Parsed and used for time-based split and seasonality. So dates **fit** the forecaster.

### Gaps (what would make features “perfect” for the models)

1. **Merchant in training** — Add a merchant column to training data (or derive it from description) and train categorizer (and optionally anomaly) on it so merchant is a first-class feature everywhere. That would **favour** the categorizer more.
2. **Description quality** — If users or feeds often send “Payment” or “Transfer” with no detail, the categorizer has little to work with. Encouraging **clear descriptions** (or using merchant when present) **favours** the model; this is about data collection, not code.
3. **Missing values** — Training already drops rows with missing date/amount; frontend should avoid passing blank description/amount. So **not leaving key fields blank** keeps features fit for the models.

---

## 4. Direct answer to “are the features fit to favour or allow the work of the models to be done perfectly?”

- **Do they allow the work to be done?** **Yes.** All five models get the inputs they need; training and inference are aligned.
- **Do they favour the models (help them do as well as they can)?** **Mostly yes.** Description and amount are used well; category and date are consistent; optional merchant at inference helps. So the way the features are **does favour** the models.
- **“Perfectly”?** **Not 100%.** To get as close as possible: (1) add merchant to training for the categorizer, (2) keep description and amount clean and non-missing, and (3) keep category names and date format consistent. With those, the current feature set would be as good as it can be for these models.

In short: **yes, the way the features are is largely fit to favour and allow the models’ work; a few small improvements would make that even more true.**
