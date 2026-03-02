# How Features Work for the Models — In Plain Language

This document explains **what features are**, **how adjusting them helps the models**, and **how it all fits together** so the models can do their job well. No jargon — just the idea.

---

## 1. What is a "feature"?

Think of a **feature** as **one piece of information** you give the model so it can make a decision.

- **Example (transaction):** The **description** ("Starbucks Coffee"), the **amount** (450), the **merchant** ("Starbucks"), the **date** (when it happened). Each of these is a feature.
- **Example (goal):** **Income**, **how much you already saved**, **how much you put in each month**, **deadline**. Each is a feature.

So: **features = the inputs the model uses to produce an output.**  
If you adjust features to **suit** or **favor** the model, you are: **giving it the right kind of information, in a clear and consistent form**, so it can do its job properly.

---

## 2. How does "adjusting features" help the model?

The model doesn’t "understand" words or dates like we do. It works with **patterns in the data**. So:

- **Good features** = information that **actually relates to the answer** and is **consistent** (same type, same format).  
  → The model can learn: "when description contains X and amount is like Y, category is usually Z."

- **Bad or messy features** = missing data, typos everywhere, different formats (e.g. "Jan 2026" vs "2026-01"), or stuff that doesn’t help (e.g. a random ID).  
  → The model gets confused or can’t use that information well.

So **adjusting features** means:

1. **Choosing** what to feed the model (only what’s useful).
2. **Cleaning** it (same format, no nonsense).
3. **Shaping** it so the model can use it (e.g. turning text into tokens, turning dates into "month" or "day of week").

When you do this **in respect to the features perfectly** (i.e. you design and clean features so they match what the model expects and what the task needs), the model can **perform at its best** — more accurate categories, better forecasts, better suggestions.

---

## 3. How it works for each model (in plain language)

### Transaction categorizer

- **Job:** Guess the **category** (Food, Transport, Rent, etc.) from a transaction.
- **Features that matter:**
  - **Description** — Words like "Starbucks", "Uber", "Rent" tell the model what it is. So: keep descriptions clear; avoid "Misc" or "Payment" for everything.
  - **Amount** — Big amounts often mean Rent or Tech; small amounts often mean Coffee or Transport. So: amount must be a real number, not missing.
  - **Merchant (optional)** — "Starbucks" strongly suggests Coffee. So: if you have merchant, use it; if not, description can carry the signal.
- **How to favor the model:**  
  Use **clear, consistent descriptions** (e.g. "Starbucks Coffee" not "STBKS 123"). Keep **amounts real** and in one currency. The model is built to use **words + amount**; when those features are good, it performs well.

---

### Spending forecaster

- **Job:** Predict **how much** will be spent in a category (e.g. next month).
- **Features that matter:**
  - **Past amounts** in that category — What you usually spend.
  - **Date / time** — Which month, so the model can learn "December is higher" or "January is lower."
  - **Category** — So it knows which series to forecast (Food vs Rent).
- **How to favor the model:**  
  **Consistent dates** (same format, no missing months where possible) and **real amounts**. The model uses **history + time**; when dates and amounts are clean and complete, forecasts are better.

---

### Budget allocator

- **Job:** Suggest **what share of your budget** should go to each category (e.g. 30% Rent, 20% Food).
- **Features that matter:**
  - **How others (or you in the past) split their budget** — e.g. "Rent 30%, Food 20%, …". So: category names and percentages must be consistent.
- **How to favor the model:**  
  **Clear category names** and **correct totals** so that shares add up. When the input tables have consistent categories and realistic splits, the model’s suggestions match reality better.

---

### Goal predictor

- **Job:** Say **whether you’re on track** for a goal and **how much to save**.
- **Features that matter:**
  - **Income** — So the model can put you in a bracket (e.g. "20–50k").
  - **Desired savings rate or target** — What people in that bracket usually save or aim for.
  - **Current amount + monthly contribution + deadline** — So it can project forward.
- **How to favor the model:**  
  **Income and targets in numbers** (no blanks, same units). When these features are present and consistent, "on track" and "suggested monthly amount" make sense.

---

### Anomaly detector

- **Job:** Flag **unusual** transactions (e.g. a very large amount for that category).
- **Features that matter:**
  - **Amount** — So it can compare to "normal" for that category.
  - **Category** — So it knows what "normal" is (Rent vs Coffee).
  - **History** — Past amounts per category so it can compute "typical" and "unusual."
- **How to favor the model:**  
  **Correct category** and **correct amount** for each transaction. When categories and amounts are reliable, "unusual" really means unusual and you get fewer false alarms.

---

## 4. Summary: "Adjusting features to suit the model"

| What you do | Why it helps |
|-------------|----------------|
| **Use clear, consistent descriptions** | The categorizer can match words to categories. |
| **Keep amounts as numbers, no missing** | All models that use amount (categorizer, forecaster, anomaly) can use it properly. |
| **Use consistent category names** | Budget, goal, and anomaly models know what each row/category means. |
| **Use consistent dates** | The forecaster (and any time-based logic) can learn seasonal patterns. |
| **Include merchant when you have it** | Extra signal for the categorizer. |
| **Don’t leave important fields blank** | Missing features = model has to guess; performance drops. |

So: **in respect to the features perfectly** means you **give each model the right inputs, in a clean and consistent form**. When you do that, the models can carry out their performance as intended — better categories, better forecasts, better budget and goal advice, and more reliable anomaly alerts.
