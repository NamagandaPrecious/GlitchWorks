# Budget Allocator — How It Works and Which Features It Uses

This document explains **how the budget allocator works** and **which features it uses and affects** in the app.

---

## 1. What the budget allocator does

The budget allocator has **two main jobs**:

1. **Suggest how to split your money across categories** (e.g. “put 30% in Rent, 20% in Food, 15% in Transport …”).  
   Used when you ask for allocation advice (e.g. in the AI Companion) or when you want a full budget plan.

2. **Suggest how much to put in a single new pod** (e.g. “for Entertainment, suggest 25,000”).  
   Used when you create a **new Flux Pod** and type a name like “Entertainment” or “Food”.

So it **affects**:
- **Suggested amounts per category** (and therefore how much you might allocate to each pod or category).
- **Suggested amount for a new pod** when you add one by name.
- **Risk assessment** (low / medium / high) when the suggested total is close to or over the money you have.

---

## 2. Features the allocator uses (inputs)

### For “suggest full allocation” (`suggestBudgetAllocation`)

| Feature | What it is | How the allocator uses it |
|--------|------------|----------------------------|
| **Available budget** | The total amount you have to split (e.g. income minus spending, or the number you set). | This is the **total pie**. All suggested amounts are scaled so they fit inside this (or the allocator reports how much is “left over” or that you’re over). |
| **Historical transactions** | Your past transactions: **category**, **amount**, **date**, **type** (income/expense). | The allocator sums spending **per category**, counts how many transactions per category, and computes **average spend per category**. It then estimates **monthly spend per category** (using the time span of your data). Suggestions are **proportional to this history**: categories you spend more on get a larger suggested share. So **category**, **amount**, and **date** are the main features affecting the split. |
| **Monthly income** | Your income (e.g. total income from transactions or what you tell the app). | Used to compute **how much you can allocate** after setting aside a buffer (e.g. 10%) and, if provided, **goal contributions**. So it affects the **size of the pie**, not the split across categories. |
| **Active goals** | List of goals with **monthly contribution** per goal. | The allocator **subtracts** total goal contributions from income (with a buffer) to get **allocatable amount**. So goals **reduce** the amount available for category allocation. |
| **Current allocations** | What you’ve already allocated per category/pod (optional). | Passed in but in the current logic the allocator mainly suggests from **history + trained shares**; it doesn’t heavily “adjust” existing allocations. So this feature is **used little** today but could affect future behaviour. |
| **Trained budget shares** (artifact) | Pre-computed **average share per category** from training data (e.g. “Rent 25%, Food 15%”). | When you have **no or very little history**, the allocator falls back to these **trained shares** and suggests: `suggestedAmount = allocatable × share` for each category. So when history is missing, **trained shares** drive the suggestion. |

So the features that **really drive** the full allocation are: **available budget**, **historical transactions** (category, amount, date), **monthly income**, **active goals**, and **trained budget shares** (when there’s no history).

### For “suggest amount for a new pod” (`suggestNewPodAllocation`)

| Feature | What it is | How the allocator uses it |
|--------|------------|----------------------------|
| **Pod name** | The name you type (e.g. “Entertainment”, “Food”, “Transport”). | The allocator **matches** the name to a category (e.g. “entertainment” → Entertainment, “food” → Dining). That **category** is then used to look up **your historical spending** for that category and, if no history, a **default share** of available budget (e.g. 10%). So the **pod name** affects **which category** is used and thus the suggested amount. |
| **Available budget** | Money left to allocate (e.g. after existing pods). | Used when you have **no history** for the matched category: suggestion = e.g. 10% of available budget. Also used to sanity-check that the suggestion is in a reasonable range. |
| **Historical transactions** | Same as above: **category**, **amount**, **date**. | For the **matched category**, the allocator computes **monthly spending** (from your past transactions in that category). Suggestion = that monthly amount + a buffer (e.g. 15%). So **your spending in that category** directly affects the suggested pod amount. |
| **Existing pods** | List of current pods with **name** and **allocated** amount. | When the pod name **doesn’t** match any known category, the allocator suggests an amount based on the **average size of your existing pods**. So **existing allocations** affect the suggestion for “custom” pods. |

So for a new pod, the features that affect the suggestion are: **pod name** (→ category), **available budget**, **historical transactions** (for that category), and **existing pods** (for custom names).

---

## 3. What the allocator outputs (what it affects)

| Output | Meaning | What in the app it affects |
|--------|--------|----------------------------|
| **Suggested amount per category** | How much to put in Rent, Food, Transport, etc. | Companion tips (“Suggested allocation for surplus: Food: X, Transport: Y”), and any UI that shows a “suggested split” or “recommended budget”. |
| **Suggested amount for one new pod** | Single number (e.g. 25,000 for “Entertainment”). | The **“New Pod”** flow: when you type a name, the AI suggests an amount and can auto-fill the allocation field. So it **affects the default budget** for a new Flux Pod. |
| **Min / max amount per category** | A range (e.g. min 20,000, max 45,000). | Can be used to show a sensible range when the user edits the suggested amount (e.g. sliders or validation). |
| **Total suggested** | Sum of all suggested amounts. | Compared to **available budget** to see if you’re under, over, or on track. |
| **Expected savings** | Available budget minus total suggested. | Shown as “left over” or “expected savings” when the suggestion is under budget. |
| **Risk assessment** | Low / medium / high. | Depends on how much of the available budget the suggestion uses (e.g. &gt;95% → high, &lt;70% → low). Can be used to warn the user. |

So the allocator **affects**: suggested amounts per category, suggested amount for a new pod, optional min/max ranges, total suggested, expected savings, and risk.

---

## 4. How training fits in (which features the *model* is trained on)

Training **does not** use your personal transactions. It uses **public or synthetic budget datasets**:

- Rows = people (or budgets); columns = amounts per category (e.g. Rent, Food, Transport).
- For each row, **share** = category amount ÷ total.
- The model computes the **average share per category** across all rows (e.g. “Rent 0.25, Food 0.15”) and saves that as **trained budget shares**.

So the **training features** are: **category** and **amount per category** (and implicitly **total budget** to get shares). The **output** is **one share per category**. At runtime, when you have no history, the app does:

`suggestedAmount = your_allocatable_budget × trained_share_for_that_category`.

So the trained model is driven by **category** and **proportions (shares)**; your **available budget** and **history** (or lack of it) decide when and how those shares are applied.

---

## 5. Short summary

- **What it does:** Suggests how to split money across categories (full allocation) and how much to put in a **new pod** when you create one.
- **Features it uses:**
  - **Full allocation:** available budget, historical transactions (category, amount, date), monthly income, active goals, trained budget shares (when no history).
  - **New pod:** pod name (→ category), available budget, historical transactions for that category, existing pods (for custom names).
- **What it affects:** Suggested amounts per category, suggested amount for a new pod, total suggested, expected savings, risk assessment, and (in the UI) Companion tips and the default amount when creating a new Flux Pod.

So the budget allocator **works** by combining **your history** (and income/goals) with **trained shares** when needed, and the **features** it both **uses** and **affects** are the ones above.
