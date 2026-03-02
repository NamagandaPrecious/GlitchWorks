# How the Goal Predictor Model Works to Fulfill Its Job

This document describes **the actual mechanism** the goal predictor uses: the formulas, the simulation, and the rules that produce completion probability, recommended contribution, risk factors, and acceleration tips. There is **no neural network** — it’s all arithmetic, a small Monte Carlo simulation, and if/then rules.

---

## 1. What the model has to fulfill

The model must produce:

- **Completion probability** (will you reach the goal by the deadline?)
- **Predicted completion date** (when would you finish at current rate?)
- **Recommended monthly contribution** (how much to save per month?)
- **Risk factors** (why you might miss the goal)
- **Acceleration opportunities** (what to do to finish sooner)

Below is how it fulfills each of these.

---

## 2. Core math (same for every run)

The model first computes a few numbers that everything else uses.

**Remaining to save**

```
remaining = targetAmount - currentAmount
```

If `remaining <= 0`, the goal is already reached → probability = 100%, months to complete = 0, and it returns immediately.

**Time until deadline**

```
daysUntilDeadline = (deadline date - today) in days
monthsUntilDeadline = daysUntilDeadline / 30  (at least 1/30)
```

**Required monthly (minimum to finish on time)**

```
requiredMonthly = remaining / monthsUntilDeadline
```

**Months to complete at your current rate**

```
monthsAtCurrentRate = remaining / monthlyContribution   (if contribution > 0)
                     else "infinity" (so we treat it as a big number)
baseMonths = monthsAtCurrentRate  (capped in code if infinite)
```

**Predicted completion date**

```
predictedCompletionDate = today + (baseMonths × 30 days)
```

So the model **fulfills** “when would I finish at current rate?” by: **remaining ÷ monthlyContribution** and turning that into a date.

---

## 3. How completion probability is produced (Monte Carlo simulation)

The model does **not** use a learned classifier for probability. It uses a **small Monte Carlo simulation** (many random “what if” scenarios).

**Idea:** Your contribution might vary a bit month to month (income or spending changes). The model simulates 1000 futures with small random variation and counts how many still finish **by the deadline**.

**Steps:**

1. **Seed a random number generator** from the goal (name, target, current, deadline, contribution) so the same goal always gets the same “random” sequence (reproducible).

2. **Run 1000 simulations.** In each one:
   - **Contribution variability (10%):**  
     `simulatedContribution = currentContribution × (1 + random in [-0.1, +0.1])`
   - **Spending variability (5%):**  
     `effectiveContribution = simulatedContribution × (1 - random in [-0.05, +0.05])`  
     (simulates that some months you might save a bit less.)
   - **Simulated months to complete:**  
     `simulatedMonths = remaining / max(effectiveContribution, currentContribution × 0.5)`
   - **Simulated completion date:**  
     `today + simulatedMonths × 30 days`
   - If **simulated completion date ≤ deadline** → count this run as “success.”

3. **Raw probability:**  
   `rawProbability = successCount / 1000`

4. **Adjust by data quality:**  
   If we have little transaction history, we’re less confident. So:
   - `dataQualityScore` is between 0.3 and 1 (from number of transactions and time span).
   - `completionProbability = rawProbability × (0.7 + 0.3 × dataQualityScore) + 0.5 × (1 - that weight)`  
   So with low data, the probability is pulled a bit toward 50%.

So the model **fulfills** “will I reach the goal by the deadline?” by **simulating 1000 futures** with slight randomness in contribution and spending, and returning the fraction that finish on time (then slightly adjusted by data quality).

---

## 4. How recommended contribution is produced (rules + affordability)

The model does **not** use an optimizer or a learned regression. It uses **fixed rules** and a **cap** from income.

**Step 1 – Affordability cap**

```
totalOtherContributions = sum of all other goals’ monthly contributions
affordabilityCap = (monthlyIncome - totalOtherContributions) × 0.7   (or “no limit” if no income)
```

So the model will never recommend more than 70% of “income left after other goals.”

**Step 2 – Trained baseline (only “learned” part)**

```
annualIncome = monthlyIncome × 12
trainedSavingsRate = lookup in trained artifact by income bracket (e.g. <20k → 0.10, 20–50k → 0.15, …)
trainedBaseline = monthlyIncome × trainedSavingsRate
```

So when you have no or low contribution, the model still has a sensible baseline suggestion from **training data** (average desired savings rate per income bracket).

**Step 3 – Raw recommendation (max of three values)**

```
rawRecommendation = max of:
  (1) requiredMonthly × 1.1        (required to finish on time + 10% buffer)
  (2) currentContribution × 1.05  (at least 5% more than you do now)
  (3) trainedBaseline × 0.9       (trained savings baseline, slightly reduced)
```

**Step 4 – Apply cap**

```
recommendedContribution = min(rawRecommendation, affordabilityCap)
```

If we had to cut the recommendation because of the cap, the model adds the risk: “Recommended contribution limited by affordability.”

So the model **fulfills** “how much should I put in each month?” by: **required monthly + buffer**, **current + 5%**, and **trained baseline**, then takes the **max** of those and **caps** it by affordability.

---

## 5. How risk factors are produced (if/then rules)

There is **no learned risk model**. The model uses **simple conditions** and appends a text to a list.

- If `currentContribution < requiredMonthly × 0.9` → add “Current contribution is below required rate.”
- If `completionProbability < 0.7` → add “Low probability of on-time completion.”
- If `daysUntilDeadline < 60` and still have remaining → add “Tight deadline with significant remaining amount.”
- If `currentContribution <= 0` → add “No active monthly contribution.”
- If `daysUntilDeadline <= 0` → add “Deadline has already passed.”
- If `dataQuality === "low"` → add “Limited historical data reduces prediction confidence.”
- If `recommendedContribution < rawRecommendation` (we capped it) → add “Recommended contribution limited by affordability.”
- If we used trained baseline and you have no contribution → add “Recommendation uses trained savings baseline.”

So the model **fulfills** “why might I miss the goal?” by **evaluating these rules** and returning the list of messages that apply.

---

## 6. How success likelihood is produced (thresholds)

**Success likelihood** is just a **label** for the completion probability. No extra model.

- probability ≥ 0.9 → “very-high”
- probability ≥ 0.75 → “high”
- probability ≥ 0.5 → “medium”
- probability ≥ 0.25 → “low”
- else → “very-low”

So the model **fulfills** “very-high / high / medium / low / very-low” by **mapping** the computed probability to these bands.

---

## 7. How acceleration opportunities are produced (spending by category)

The model does **not** use a separate ML model for “what to cut.” It uses **your transaction history** and simple arithmetic.

**Steps:**

1. Sum **expense** amounts **by category** from `historicalTransactions`.
2. Sort categories by total spent (descending) and take the **top 3**.
3. For each of those categories:
   - Estimate **monthly** spend: `(category total / timeSpanDays) × 30`.
   - Assume you could cut that by **20%**: `potentialSavings = monthlyAmount × 0.2`.
   - Estimate **days saved** if you put that into the goal:  
     `daysSaved = (potentialSavings / recommendedContribution) × 30`.
   - If `daysSaved > 5`, add an opportunity: “Reduce [category] spending by 20%” with impact = round(daysSaved).

So the model **fulfills** “what can I do to finish sooner?” by **summing your spending by category**, taking the top categories, and computing how many days you’d save by reallocating a 20% cut to the goal.

---

## 8. Confidence interval (simple spread)

The model does **not** use a learned uncertainty model. It uses a **fixed spread** around `baseMonths`:

```
stdDev = baseMonths × 0.15
lowerMonths = baseMonths - 1.96 × stdDev
upperMonths = baseMonths + 1.96 × stdDev
confidenceInterval.lower = today + lowerMonths × 30 days
confidenceInterval.upper = today + upperMonths × 30 days
```

So the model **fulfills** “between when and when might I finish?” by **± about 30%** of the base months (in a normal-distribution style band).

---

## 9. Summary: how the model fulfills the goal predictor

| What we need | How the model fulfills it |
|--------------|----------------------------|
| **Completion probability** | Monte Carlo: 1000 runs with ±10% contribution and ±5% spending variation; count how many finish by deadline; divide by 1000; adjust slightly by data quality. |
| **Predicted completion date** | Arithmetic: `remaining / monthlyContribution` months → date = today + that many months. |
| **Recommended contribution** | Rules: max(required×1.1, current×1.05, trainedBaseline×0.9), then cap by (income − other goals)×0.7. |
| **Risk factors** | If/then rules on contribution vs required, probability, deadline, data quality, and affordability cap. |
| **Success likelihood** | Map probability to one of five labels using fixed thresholds. |
| **Acceleration opportunities** | Sum expenses by category; top 3; 20% cut → potential savings → days saved vs recommended contribution. |
| **Confidence interval** | baseMonths ± 1.96 × (0.15 × baseMonths), converted to dates. |

The **only** part that comes from **training** is **trained savings rates** (per income bracket); everything else is **formulas, simulation, and rules**. So the model **fulfills** the goal predictor by combining that one trained artifact with deterministic math and a small Monte Carlo simulation.
