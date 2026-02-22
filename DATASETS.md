# Transaction training datasets

The notebook expects CSV with **Text** and **Category Id** (0–9).

---

## Real data from Kaggle (recommended if you want real transactions)

Use the Kaggle API to download a **real** transaction dataset and convert it to our format.

### 1. Get a Kaggle API token

1. Create a free account at [kaggle.com](https://www.kaggle.com).
2. Open [Account → API](https://www.kaggle.com/settings/account), click **Create New Token**.
3. Copy the token (starts with `KGAT_...`). Either:
   - **Option A (recommended):** Set the environment variable before running the script:
     ```bash
     export KAGGLE_API_TOKEN=KGAT_your_token_here
     ```
   - **Option B:** If you have a legacy `kaggle.json` file, place it at `~/.kaggle/kaggle.json` and `chmod 600 ~/.kaggle/kaggle.json`.

### 2. Install and run

**Option A – kagglehub (no API token):**

```bash
pip install kagglehub pandas
cd /path/to/transaction-categorization-main
python scripts/download_kaggle_transactions.py --use-kagglehub --dataset trinaghosh346/personal-income-expenditure
```

**Option B – Kaggle API (needs token):**

```bash
pip install kaggle pandas
export KAGGLE_API_TOKEN=KGAT_your_token_here
python scripts/download_kaggle_transactions.py
```

This downloads the dataset and writes **transactions_kaggle.csv** (and optionally _train.csv / _test.csv) in the project root.

### 3. Use another Kaggle dataset

On Kaggle, open the dataset page and copy the URL slug (e.g. `owner/dataset-name`). Then:

```bash
python scripts/download_kaggle_transactions.py --dataset owner/dataset-name
```

**Datasets to try (real or real-style transaction data):**

| Dataset | Slug |
|--------|------|
| Personal Budget Transactions | `ismetsemedov/personal-budget-transactions-dataset` |
| Financial Transactions (Expenses & Income) | `artemkabseu/financial-transactions-dataset-expenses-and-income` (often has train/test files) |
| Bank Transaction Data | `apoorvwatsky/bank-transaction-data` |

Accept each dataset’s terms on its Kaggle page before downloading. The script maps common category names (e.g. “Food & Drink”, “Rent”, “Entertainment”) to our Category Ids 0–9.

### 4. Point the notebook at the Kaggle file

**Single file:** use `transactions_kaggle.csv` in the first cell.

**Train and test under category:** If the downloaded dataset had `train.csv` and `test.csv`, the script wrote **transactions_kaggle_train.csv** and **transactions_kaggle_test.csv**. Load train for fitting and test only for evaluation:

```python
train_path = Path("transactions_kaggle_train.csv")
test_path = Path("transactions_kaggle_test.csv")
if train_path.exists() and test_path.exists():
    dataset = pd.read_csv(train_path)
    test_df = pd.read_csv(test_path)  # reserve for final evaluation
else:
    _csv = Path("transactions_kaggle.csv")
    dataset = pd.read_csv(_csv if _csv.exists() else Path.cwd() / "transactions_kaggle.csv")
```

---

## Synthetic/curated (no download)

| File | Notes |
|------|------|
| **transactions_dataset.csv** | ~644 rows, mix of short descriptions and phrases. Same 10 categories. |

Default in the notebook is `transactions_dataset.csv`. Use this if you don’t want to use Kaggle.

---

## Optional: Hugging Face

The [mitulshah/transaction-categorization](https://huggingface.co/datasets/mitulshah/transaction-categorization) dataset has 4.5M rows (real-style descriptions).

1. Accept terms and log in at the link above.
2. `pip install datasets` then run `python scripts/download_transaction_dataset.py`.
3. Output: **transactions_from_hf.csv**. In the notebook: `_csv = Path("transactions_from_hf.csv")`.

---

## Category Id reference (0–9)

0 = Automobile and Transport  
1 = Housing and Real-Estate  
2 = Groceries  
3 = Recreation and Leisure  
4 = Health and Well Being  
5 = Hobby and Knowledge  
6 = Clothes and Equipment  
7 = Cash and Credit  
8 = Financial Services  
9 = Other  
