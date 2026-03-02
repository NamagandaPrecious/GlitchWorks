# Goal Predictor — How It Works and Which Features It Uses

This document explains **how the goal predictor works** and **which features it uses and affects** in the app.

---

## 1. What the goal predictor does

The goal predictor answers: **“Will I reach this goal by the deadline, and what should I do to improve my chances?”**

It takes **one goal** (and your context) and returns:

- **Completion probability** (0–100%): chance of reaching the target by the deadline.
- **Predicted completion date**: when you’d reach the target at your current contribution rate.
- **Recommended monthly contribution**: suggested amount to put in each month.
- **Success likelihood** (e.g. very-high, high, medium, low, very-low).
- **Risk factors**: reasons the goal might be at risk (e.g. contribution too low, deadline tight).
- **Acceleration opportunities**: actions that could help you reach the goal sooner (e.g. “Reduce Food spending by 20%” with estimated days saved).
- **Months to complete** and a **confidence interval** (date range) for completion.

So it **affects**: the numbers and labels you see for each goal (probability, months, success level), the recommended contribution, risk messages, and the “what you could do to speed up” tips.

---

## 2. Features the goal predictor uses (inputs)

### Goal fields (the goal you’re predicting)

| Feature | What it is | How the predictor uses it |
|--------|------------|----------------------------|
| **Goal name** | e.g. “Emergency fund”, “Vacation”. | Used for display and as part of the random seed in the simulated probability; does not change the math. |
| **Target amount** | How much you want to reach (e.g. 5,000,000). | **Remaining** = target − current. All time and contribution math is based on **remaining**. |
| **Current amount** | How much you’ve already saved for this goal. | **Remaining** = target − current. Larger current → smaller remaining → sooner completion and higher probability. |
| **Monthly contribution** | How much you put in each month for this goal. | **Core driver.** Required monthly = remaining ÷ months until deadline. If your contribution is above that, probability goes up; if below, probability goes down. Also used to compute **months to complete** and **predicted completion date**. |
| **Deadline** | Date you want to reach the target. | **Months until deadline** = (deadline − today) ÷ 30. **Required monthly** = remaining ÷ months until deadline. Tighter deadline → higher required monthly → harder to hit → lower probability and more risk factors. |

So the **goal itself** is the main input: **target**, **current**, **monthly contribution**, and **deadline** drive the prediction.

### Your context (income, other goals, history)

| Feature | What it is | How the predictor uses it |
|--------|------------|----------------------------|
| **Monthly income** | Your income (e.g. from transactions or profile). | 1) **Income bracket** for **trained savings rate**: the model looks up “typical savings rate” for your income (e.g. &lt;20k, 20–50k, 50–100k, …). That gives a **baseline suggested savings** when you have no or low contribution. 2) **Affordability cap**: recommended contribution is capped at a share of (income − other goals’ contributions) so the suggestion stays realistic. So **income** affects **recommended contribution** and **risk** (“limited by affordability”). |
| **Active goals** (other goals’ monthly contributions) | List of all goals and their monthly contributions. | **Total other contributions** = sum of other goals’ contributions. Your **affordability cap** = (income − other contributions) × e.g. 70%. So other goals **reduce** how much the predictor can sensibly recommend for this goal. They also affect whether you get a risk like “Recommended contribution limited by affordability”. |
| **Historical transactions** | Your past transactions: **category**, **amount**, **type**, **date**. | 1) **Data quality**: more transactions and longer time span → higher “data quality” → probability is adjusted slightly (more confidence). 2) **Acceleration opportunities**: spending is summed **per category**; top spending categories are used to suggest “Reduce X by 20%” and **estimated days saved** (based on how much that could free up vs recommended contribution). So **category** and **amount** (and **date** for time span) affect **data quality** and **acceleration tips**; they do **not** change the core completion math (that’s target, current, contribution, deadline). |

### Trained artifact (from training)

| Feature | What it is | How the predictor uses it |
|--------|------------|----------------------------|
| **Trained savings rates** | Average “desired savings %” per **income bracket** (e.g. &lt;20k → 10%, 20–50k → 15%). | When your **monthly contribution** is zero or very low, the predictor uses **income × trained rate** as a **baseline** for the **recommended contribution**. So **income** (through the bracket) + **trained rates** drive the suggested amount when you’re not yet contributing. |

So the **features that affect the goal predictor** are: **goal** (target, current, monthly contribution, deadline), **monthly income**, **other goals’ contributions**, **historical transactions** (for quality and acceleration tips), and **trained savings rates** (for baseline recommendation by income).

---

## 3. What the goal predictor outputs (what it affects in the app)

| Output | Meaning | Where it shows up |
|--------|--------|--------------------|
| **Completion probability** | 0–1 (or 0–100%) chance of reaching the target by the deadline. | Goals page (e.g. “75%”), Companion (“75% completion probability”). |
| **Success likelihood** | Label: very-high / high / medium / low / very-low. | Goals page and Companion (e.g. “high (75% completion probability)”). |
| **Months to complete** | How many months until target at current contribution rate. | Goals page and Companion (“~X months to target”). |
| **Predicted completion date** | Date you’d reach the target at current rate. | Can be shown on Goals or in details. |
| **Confidence interval** | Lower and upper date for when you might complete. | Used for “between X and Y” if the UI shows a range. |
| **Recommended contribution** | Suggested monthly amount for this goal. | Goals page “Apply recommendation” and any tip that says “consider contributing X”. |
| **Risk factors** | Short text reasons (e.g. “Current contribution below required rate”). | Goals page or Companion when explaining why probability is low or what to fix. |
| **Acceleration opportunities** | e.g. “Reduce Food spending by 20%” with **impact** (days saved). | Shown as tips to reach the goal sooner; driven by **your spending by category** from history. |
| **Data quality** | low / medium / high. | Can be used to show “Limited data” or to explain confidence. |

So the goal predictor **affects**: the **probability and success label** you see, **months to complete**, **recommended contribution**, **risk messages**, and **acceleration tips** (which are based on your spending by category).

---

## 4. How training fits in (which features the *model* is trained on)

Training uses **one dataset** (e.g. habits survey):

- **Features**: **Income** (numeric) and **Desired_Savings_Percentage** (numeric).
- **Processing**: Income is binned into brackets (e.g. &lt;20k, 20–50k, 50–100k, 100–200k, 200–500k, 500k+). For each bracket, the **average desired savings percentage** is computed.
- **Output**: **Trained savings rates** per bracket (e.g. “20–50k” → 0.15). Saved as the goal-predictor artifact.

At runtime, **monthly income** is converted to an income bracket (using the same logic as in training), and the **trained rate** for that bracket is used as a **baseline savings rate** when recommending how much to contribute. So the **training features** are **income** and **desired savings %**; the **runtime feature** that ties to the model is **your income** (and thus your bracket).

---

## 5. Short summary

- **What it does:** Predicts whether you’ll reach a goal by the deadline, suggests a monthly contribution, and lists risks and ways to speed up.
- **Features it uses:**
  - **Goal:** target amount, current amount, monthly contribution, deadline (main drivers of probability and months to complete).
  - **Monthly income:** income bracket → trained savings rate (baseline recommendation), and affordability cap for recommended contribution.
  - **Other goals’ contributions:** reduce “affordable” amount for this goal and can trigger “limited by affordability”.
  - **Historical transactions:** data quality (slight effect on probability) and **category + amount** for **acceleration opportunities** (“reduce X by 20%”).
  - **Trained savings rates:** baseline recommended contribution when you have no or low contribution.
- **What it affects:** Completion probability, success likelihood, months to complete, predicted completion date, recommended contribution, risk factors, and acceleration opportunities on the Goals page and in the AI Companion.

So the **goal predictor** works by combining **goal numbers** (target, current, contribution, deadline) with **income** (and trained rates) and **other goals** for recommendations, and **transaction history** (by category) for acceleration tips; those are the **features** it both **uses** and **affects** in the app.
