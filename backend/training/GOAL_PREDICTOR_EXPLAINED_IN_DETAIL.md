# Goal Predictor — Explained in Detail (Step by Step)

This document explains the goal predictor in **plain language** with **one concrete example** so you can see exactly how each number is used and what each result means.

---

## 1. In one sentence, what does the goal predictor do?

**It looks at your goal (how much you want, how much you have, how much you put in each month, and when you want it), and it tells you: (1) will you get there by the deadline?, (2) when would you get there at your current rate?, and (3) how much you should put in each month to be safe.**

Everything below is the same idea, broken into small steps.

---

## 2. One example from start to finish

Suppose you have **one goal**:

- **Name:** Emergency fund  
- **Target amount:** 5,000,000 (you want to save 5 million)  
- **Current amount:** 1,000,000 (you’ve already saved 1 million)  
- **Monthly contribution:** 200,000 (you put in 200k every month)  
- **Deadline:** 12 months from today  

We’ll see how the predictor uses these to produce **remaining**, **required monthly**, **months to complete**, **probability**, and **recommended contribution**.

---

### Step 1: How much is left to save?

- **Remaining** = Target − Current  
- **Remaining** = 5,000,000 − 1,000,000 = **4,000,000**

So the predictor only cares about the **4 million you still need to save**. Everything that follows is about “how do I get to 4 million?”

---

### Step 2: How much time do you have?

- **Deadline** = 12 months from today  
- So **months until deadline** = 12  

The predictor uses this to answer: “You have 12 months to save 4 million. Is that enough?”

---

### Step 3: How much do you *need* to put in each month to get there in time?

- **Required monthly** = Remaining ÷ Months until deadline  
- **Required monthly** = 4,000,000 ÷ 12 ≈ **333,333 per month**

So **to reach the goal by the deadline**, you need to save about **333,333 every month**.  

- Your **actual** contribution is **200,000 per month**.  
- 200,000 is **less** than 333,333, so **at your current rate you will not reach 5 million in 12 months**. That’s why the predictor will show a **lower probability** and may say your contribution is below the required rate.

---

### Step 4: If you keep putting 200k per month, when *would* you reach 4 million?

- **Months to complete** (at current rate) = Remaining ÷ Your monthly contribution  
- **Months to complete** = 4,000,000 ÷ 200,000 = **20 months**

So **at 200k per month**, you’d reach the target in **20 months**, not 12.  

- The app turns this into a **predicted completion date** (today + 20 months).  
- Because 20 months is **after** your 12‑month deadline, the predictor will say something like “low or medium” chance of finishing on time, and might add a risk: “Current contribution is below required rate.”

---

### Step 5: What is “completion probability”?

The predictor doesn’t only do the simple math above. It also simulates **small variations** (e.g. you might put in a bit more or less some months, or income might vary). So:

- **Completion probability** = “Out of many possible futures, in how many do you still reach the target by the deadline?”

If your contribution is **above** the required monthly (333k), most of those futures will finish on time → **high probability** (e.g. 80–95%).  
If your contribution is **below** (like 200k), many futures will finish **after** the deadline → **lower probability** (e.g. 30–50%).

So in our example, **probability might be around 30–40%** (or similar), meaning “there’s a moderate chance you won’t make it by 12 months if you keep 200k/month.”

---

### Step 6: What is “recommended contribution”?

The predictor suggests **how much you should put in each month** so you’re more likely to hit the goal on time.

- It takes **required monthly** (333,333) and adds a small buffer (e.g. 10%) so you’re safe: e.g. **333,333 × 1.1 ≈ 366,666**.  
- It also checks **affordability**: it looks at your **monthly income** and **other goals’ contributions**. It won’t recommend more than a reasonable share of what’s left after other goals (e.g. no more than 70% of “free” income). So:
  - If you earn 1,000,000/month and have no other goals, 366k might be fine → **recommended contribution ≈ 366,666**.  
  - If you earn 500,000 and already put 200k into other goals, the predictor might cap the recommendation at e.g. 210k → **recommended contribution = 210,000** and it may add a risk: “Recommended contribution limited by affordability.”

So **recommended contribution** = “Put at least this much per month (and we cap it so it’s affordable).”

---

### Step 7: Where do “income” and “other goals” come in?

- **Income**  
  - Used to **cap** the recommended contribution (so the app doesn’t tell you to save more than you can).  
  - Also used to pick an **income bracket** (e.g. 20–50k, 50–100k). The **trained model** has a “typical savings rate” per bracket. If you have **no** or **very low** monthly contribution, the predictor uses **income × that rate** as a **baseline** for the recommended contribution. So income affects **how much the app suggests you save** when you’re not yet saving, and **how high** it can suggest (affordability).

- **Other goals**  
  - If you have a second goal where you put 100k/month, that 100k is “already used.” So when the predictor computes “how much can you afford for this goal?”, it does: **income − other goals’ contributions**, then takes a share of that (e.g. 70%). So **other goals reduce** the maximum recommended contribution for this goal and can trigger “limited by affordability.”

---

### Step 8: What are “acceleration opportunities”?

These are **tips to reach the goal sooner** (e.g. “Reduce Food spending by 20%”).

- The predictor looks at **your past spending by category** (from your transactions): e.g. Food 500k, Transport 200k, Entertainment 150k.  
- It picks the **top spending categories** and says: “If you cut this category by 20%, you’d free up X per month. If you put that X into this goal, you’d reach it Y days sooner.”  
- So **acceleration opportunities** depend on **your transaction history** (category + amount). They **don’t change** the main math (remaining, required monthly, months to complete, probability); they only suggest **extra actions** to speed things up.

---

## 3. Putting it all together (same example)

| What you have | Value | What the predictor does with it |
|---------------|--------|----------------------------------|
| Target | 5,000,000 | Remaining = 5M − 1M = **4,000,000** |
| Current | 1,000,000 | (see above) |
| Monthly contribution | 200,000 | Months to complete = 4M ÷ 200k = **20 months**; compares 200k to required 333k → **probability goes down** |
| Deadline | 12 months | Required monthly = 4M ÷ 12 ≈ **333,333**; 200k < 333k → risk “below required rate” |
| Income | e.g. 800,000 | Caps recommendation; if no contribution yet, uses income bracket + trained rate for baseline |
| Other goals | e.g. 100,000 total | Affordability = (800k − 100k) × 70% = 490k → recommendation capped at 490k or less |
| History (spending by category) | Food 500k, Transport 200k, … | Used only for **acceleration tips** (“Reduce Food by 20%”, etc.) |

**Result you see:**

- **Remaining:** 4,000,000  
- **Required monthly:** ~333,333  
- **Months to complete (at 200k/month):** 20  
- **Predicted completion date:** today + 20 months (after deadline)  
- **Completion probability:** e.g. 35% (many simulated futures miss the deadline)  
- **Success likelihood:** e.g. “low”  
- **Recommended contribution:** e.g. 366,666 (or less if capped by affordability)  
- **Risk factors:** e.g. “Current contribution is below required rate”  
- **Acceleration opportunities:** e.g. “Reduce Food spending by 20%” (from your spending history)

---

## 4. Short checklist so you “get it right”

1. **Remaining** = Target − Current (how much is left to save).  
2. **Required monthly** = Remaining ÷ Months until deadline (minimum you need to save per month to finish on time).  
3. **Your contribution** vs **required monthly**:
   - Contribution **≥** required → high chance of on-time completion.  
   - Contribution **<** required → lower chance; predictor may say “below required rate.”  
4. **Months to complete** = Remaining ÷ Your contribution (when you’d finish at current rate).  
5. **Completion probability** = chance you finish by the deadline (takes small variations into account).  
6. **Recommended contribution** = required monthly + buffer, but **capped** by your income and other goals (affordability).  
7. **Income** = used for affordability cap and (when you don’t contribute yet) for a baseline suggestion via trained savings rate.  
8. **Other goals** = reduce how much the app can sensibly recommend for this goal.  
9. **Transaction history** (by category) = used only for **acceleration tips**, not for the main completion math.

If you follow this checklist with your own numbers (target, current, contribution, deadline, income, other goals), you can reproduce the logic of the goal predictor step by step.
