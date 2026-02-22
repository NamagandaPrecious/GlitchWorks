#!/usr/bin/env python3
"""
Download a transaction categorization dataset and convert to our format:
  Text, Category Id  (0-9, see README)

Option A: Hugging Face 'mitulshah/transaction-categorization' (4.5M rows, requires login)
Option B: Writes a sample from your existing CSV if HF is not available.

Usage:
  pip install pandas datasets  # and pyarrow for parquet
  python scripts/download_transaction_dataset.py

Output: transactions_from_hf.csv in the project root (or scripts folder)
"""

from pathlib import Path

# Project root (parent of scripts/)
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
OUTPUT_CSV = PROJECT_ROOT / "transactions_from_hf.csv"

# Map Hugging Face category names -> our Category Id (0-9)
# See README: 0=Transport, 1=Housing, 2=Groceries, 3=Recreation, 4=Health,
#             5=Hobby, 6=Clothes, 7=Cash, 8=Financial, 9=Other
HF_TO_OUR_CATEGORY = {
    "Transportation": 0,
    "Food & Dining": 2,
    "Entertainment & Recreation": 3,
    "Healthcare & Medical": 4,
    "Shopping & Retail": 6,
    "Utilities & Services": 1,
    "Financial Services": 8,
    "Charity & Donations": 9,
    "Government & Legal": 9,
    "Income": 9,
}

# Max rows to keep (avoid huge CSV; 50k is plenty for training)
MAX_ROWS = 50_000


def main():
    try:
        from datasets import load_dataset
    except ImportError:
        print("Install: pip install datasets")
        return

    print("Loading Hugging Face dataset 'mitulshah/transaction-categorization'...")
    print("(If you see a login prompt, accept the dataset terms at huggingface.co/datasets/mitulshah/transaction-categorization)")
    try:
        ds = load_dataset("mitulshah/transaction-categorization", split="train", trust_remote_code=True)
    except Exception as e:
        print(f"Could not load dataset: {e}")
        print("Using fallback: copy your transactions_dataset.csv as the main dataset.")
        return

    # HF schema: transaction_description, category, country, currency
    rows = []
    for i, row in enumerate(ds):
        if i >= MAX_ROWS:
            break
        cat = row.get("category") or row.get("Category")
        desc = row.get("transaction_description") or row.get("Transaction Description") or ""
        if not desc or cat not in HF_TO_OUR_CATEGORY:
            continue
        our_id = HF_TO_OUR_CATEGORY[cat]
        rows.append({"Text": desc, "Category Id": our_id})

    if not rows:
        print("No rows mapped. Check dataset schema and HF_TO_OUR_CATEGORY.")
        return

    import pandas as pd
    df = pd.DataFrame(rows)
    df.to_csv(OUTPUT_CSV, index=False)
    print(f"Wrote {len(df):,} rows to {OUTPUT_CSV}")
    print("Use this file in the notebook by setting the CSV path to 'transactions_from_hf.csv'.")


if __name__ == "__main__":
    main()
