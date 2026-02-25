#!/usr/bin/env python3
"""
Download a **real** transaction dataset from Kaggle and convert to our format:
  Text, Category Id  (0-9, see README)

Requires: Kaggle API key (see DATASETS.md).

Usage:
  pip install kaggle pandas
  python scripts/download_kaggle_transactions.py
  python scripts/download_kaggle_transactions.py --dataset ismetsemedov/personal-budget-transactions-dataset

  # Or use kagglehub (no API token needed):
  pip install kagglehub pandas
  python scripts/download_kaggle_transactions.py --use-kagglehub --dataset trinaghosh346/personal-income-expenditure

Output: transactions_kaggle.csv (and optionally _train.csv / _test.csv) in the project root.
"""

import argparse
import sys
import zipfile
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
OUTPUT_CSV = PROJECT_ROOT / "transactions_kaggle.csv"
DOWNLOAD_DIR = PROJECT_ROOT / "kaggle_download"

# Our category ids (README): 0=Transport, 1=Housing, 2=Groceries, 3=Recreation,
# 4=Health, 5=Hobby, 6=Clothes, 7=Cash, 8=Financial, 9=Other

# Map common real-dataset category names (any case) -> our 0-9
CATEGORY_NAME_TO_ID = {
    # Transport
    "transport": 0, "transportation": 0, "travel": 0, "auto": 0, "automobile": 0,
    "car": 0, "fuel": 0, "gas": 0, "petrol": 0, "uber": 0, "taxi": 0,
    "parking": 0, "transit": 0, "public transport": 0,
    # Housing
    "rent": 1, "housing": 1, "utilities": 1, "electricity": 1, "water": 1,
    "gas bill": 1, "internet": 1, "phone": 1, "mortgage": 1, "real estate": 1,
    "groceries": 2, "food": 2, "grocery": 2, "supermarket": 2,
    "food & drink": 2, "food and drink": 2, "dining": 2,
    # Recreation
    "entertainment": 3, "recreation": 3, "leisure": 3, "restaurant": 3,
    "restaurants": 3, "coffee": 3, "bar": 3, "pub": 3, "movies": 3,
    "cinema": 3, "streaming": 3, "subscription": 3, "sports": 3,
    "games": 3, "gaming": 3, "hobby": 5, "education": 5, "books": 5,
    "health": 4, "healthcare": 4, "medical": 4, "pharmacy": 4,
    "doctor": 4, "dentist": 4, "gym": 4, "fitness": 4,
    "health & fitness": 4, "health and fitness": 4,
    # Shopping / clothes
    "shopping": 6, "retail": 6, "clothes": 6, "clothing": 6, "electronics": 6,
    "furniture": 6, "equipment": 6, "stores": 6,
    # Cash
    "cash": 7, "withdrawal": 7, "atm": 7, "transfer": 7,
    # Financial
    "financial": 8, "insurance": 8, "bank": 8, "investment": 8,
    "savings": 8, "loan": 8, "salary": 8, "income": 8,
    "financial services": 8, "utilities & services": 1,
    # Other
    "other": 9, "misc": 9, "miscellaneous": 9, "unknown": 9,
    "charity": 9, "donation": 9, "government": 9, "tax": 8,
}


def normalize_category(s):
    if s is None or (isinstance(s, float) and str(s) == "nan"):
        return None
    return str(s).strip().lower()


def map_category_to_id(cat_name):
    n = normalize_category(cat_name)
    if not n:
        return None
    if n in CATEGORY_NAME_TO_ID:
        return CATEGORY_NAME_TO_ID[n]
    # Try partial match (e.g. "Food & Drink" -> "food & drink" already; "Groceries" -> "groceries")
    for key, cid in CATEGORY_NAME_TO_ID.items():
        if key in n or n in key:
            return cid
    return 9  # Other


def find_text_and_category_columns(df):
    text_candidates = [
        "transaction description", "description", "text", "details", "narration",
        "merchant", "name", "transaction_description", "transaction details",
    ]
    cat_candidates = ["category", "categories", "label", "type", "expense type", "category id"]
    cols = [c.lower() for c in df.columns]
    text_col = None
    for c in text_candidates:
        for i, col in enumerate(cols):
            if c in col or col in c:
                text_col = df.columns[i]
                break
        if text_col is not None:
            break
    if text_col is None and len(df.columns) >= 1:
        text_col = df.columns[0]
    cat_col = None
    for c in cat_candidates:
        for i, col in enumerate(cols):
            if c in col or col in c:
                cat_col = df.columns[i]
                break
        if cat_col is not None:
            break
    if cat_col is None and len(df.columns) >= 2:
        cat_col = df.columns[1]
    return text_col, cat_col


def convert_csv_to_our_format(csv_path, text_col, cat_col, max_rows, map_category_to_id):
    import pandas as pd
    df = pd.read_csv(csv_path, nrows=max_rows)
    rows = []
    for _, r in df.iterrows():
        text = r[text_col]
        if pd.isna(text) or str(text).strip() == "":
            continue
        cat_id = map_category_to_id(r[cat_col])
        if cat_id is None:
            continue
        rows.append({"Text": str(text).strip(), "Category Id": cat_id})
    return pd.DataFrame(rows)


def main():
    parser = argparse.ArgumentParser(description="Download Kaggle transaction dataset and convert to Text, Category Id")
    parser.add_argument(
        "--dataset",
        default="ismetsemedov/personal-budget-transactions-dataset",
        help="Kaggle dataset slug (owner/dataset-name). For train+test under category use one that has train.csv and test.csv (e.g. artemkabseu/financial-transactions-dataset-expenses-and-income).",
    )
    parser.add_argument("--max-rows", type=int, default=500_000, help="Max rows to keep (default 500000)")
    parser.add_argument("--use-kagglehub", action="store_true", help="Use kagglehub instead of Kaggle API (pip install kagglehub). No API token needed.")
    args = parser.parse_args()

    # 1) Download dataset
    if args.use_kagglehub:
        try:
            import kagglehub
        except ImportError:
            print("kagglehub not found. Run: pip install kagglehub")
            sys.exit(1)
        print(f"Downloading via kagglehub: {args.dataset}")
        path = kagglehub.dataset_download(args.dataset)
        download_root = Path(path)
        print("Path to dataset files:", download_root)
    else:
        try:
            from kaggle.api.kaggle_api_extended import KaggleApi
        except ImportError:
            print("Kaggle package not found. Run: pip install kaggle")
            sys.exit(1)
        DOWNLOAD_DIR.mkdir(parents=True, exist_ok=True)
        print(f"Downloading Kaggle dataset: {args.dataset}")
        print("(Set KAGGLE_API_TOKEN or use ~/.kaggle/kaggle.json. See DATASETS.md.)")
        try:
            api = KaggleApi()
            api.authenticate()
            api.dataset_download_files(args.dataset, path=DOWNLOAD_DIR, unzip=True)
        except Exception as e:
            print(f"Kaggle download failed: {e}")
            print("Check: 1) pip install kaggle  2) export KAGGLE_API_TOKEN=your_token or ~/.kaggle/kaggle.json  3) You accepted the dataset terms on Kaggle.")
            sys.exit(1)
        download_root = DOWNLOAD_DIR

    # 2) Find CSVs (in download_root or inside a zip)
    csvs = list(Path(download_root).rglob("*.csv"))
    if not csvs and not args.use_kagglehub:
        zips = list(download_root.glob("*.zip"))
        if zips:
            extract_dir = download_root / "extracted"
            extract_dir.mkdir(parents=True, exist_ok=True)
            with zipfile.ZipFile(zips[0], "r") as z:
                z.extractall(extract_dir)
            csvs = list(extract_dir.rglob("*.csv"))
        if not csvs:
            print("No CSV found in", download_root)
            sys.exit(1)
    if not csvs:
        print("No CSV found in", download_root)
        sys.exit(1)

    # Split into train vs test by filename (e.g. train.csv, test.csv)
    def is_train(p):
        n = p.name.lower()
        return "train" in n or "training" in n
    def is_test(p):
        n = p.name.lower()
        return "test" in n and "train" not in n  # test.csv, testing.csv, not train_test.csv
    train_csvs = sorted([p for p in csvs if is_train(p)])
    test_csvs = sorted([p for p in csvs if is_test(p)])

    import pandas as pd

    if train_csvs and test_csvs:
        # Dataset has separate train and test under category (files)
        print(f"Found train file(s): {[p.name for p in train_csvs]}")
        print(f"Found test file(s): {[p.name for p in test_csvs]}")
        csv_path = train_csvs[0]
    else:
        # Single CSV or no clear split: use first CSV by preference
        csvs.sort(key=lambda p: (0 if "transaction" in p.name.lower() or "train" in p.name.lower() else 1, p.name))
        csv_path = csvs[0]
        train_csvs, test_csvs = [csv_path], []

    print(f"Using CSV: {csv_path.name}")

    # 3) Detect columns and convert
    df = pd.read_csv(csv_path, nrows=min(1000, args.max_rows))
    text_col, cat_col = find_text_and_category_columns(df)
    if text_col is None:
        print("Could not detect text column. Columns:", list(df.columns))
        sys.exit(1)
    if cat_col is None:
        print("Could not detect category column. Columns:", list(df.columns))
        sys.exit(1)
    print(f"Detected text column: '{text_col}', category column: '{cat_col}'")

    if train_csvs and test_csvs:
        out_train = PROJECT_ROOT / "transactions_kaggle_train.csv"
        out_test = PROJECT_ROOT / "transactions_kaggle_test.csv"
        train_df = convert_csv_to_our_format(train_csvs[0], text_col, cat_col, args.max_rows, map_category_to_id)
        test_df = convert_csv_to_our_format(test_csvs[0], text_col, cat_col, args.max_rows, map_category_to_id)
        train_df.to_csv(out_train, index=False)
        test_df.to_csv(out_test, index=False)
        print(f"Wrote {len(train_df):,} rows to {out_train}")
        print(f"Wrote {len(test_df):,} rows to {out_test}")
        print("In the notebook: use transactions_kaggle_train.csv for training and transactions_kaggle_test.csv for evaluation (no random split).")
    else:
        out_df = convert_csv_to_our_format(csv_path, text_col, cat_col, args.max_rows, map_category_to_id)
        out_df.to_csv(OUTPUT_CSV, index=False)
        print(f"Wrote {len(out_df):,} rows to {OUTPUT_CSV}")
        print("In the notebook, use: _csv = Path('transactions_kaggle.csv')")


if __name__ == "__main__":
    main()
