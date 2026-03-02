import argparse
import argparse
import json
import math
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional

import numpy as np
import pandas as pd


ROOT = Path(__file__).resolve().parents[2]  # Go up 2 levels: backend/training -> backend -> root
ARTIFACTS_DIR = ROOT / "frontend" / "src" / "lib" / "ai" / "models" / "artifacts"
REPORTS_DIR = ROOT / "backend" / "training" / "reports"

DATASET_MANIFEST = ROOT / "backend" / "training" / "data" / "datasets_manifest.json"

DEFAULT_DATASET_PATHS = {
    # Curated clean sources for transaction categorization/spending series
    "entrepreneurlife/personal-finance": Path("/home/mukama/.cache/kagglehub/datasets/entrepreneurlife/personal-finance/versions/2"),
    "thedevastator/analyzing-credit-card-spending-habits-in-india": Path("/home/mukama/.cache/kagglehub/datasets/thedevastator/analyzing-credit-card-spending-habits-in-india/versions/3"),
    "bukolafatunde/personal-finance": Path("/home/mukama/.cache/kagglehub/datasets/bukolafatunde/personal-finance/versions/4"),
    "willianoliveiragibin/financial-wellness": Path("/home/mukama/.cache/kagglehub/datasets/willianoliveiragibin/financial-wellness/versions/1"),
    "ismetsemedov/personal-budget-transactions-dataset": Path("/home/mukama/.cache/kagglehub/datasets/ismetsemedov/personal-budget-transactions-dataset/versions/4"),
    "mohammedarfathr/budgetwise-personal-finance-dataset": Path("/home/mukama/.cache/kagglehub/datasets/mohammedarfathr/budgetwise-personal-finance-dataset/versions/2"),
    "trinaghosh346/personal-income-expenditure": Path("/home/mukama/.cache/kagglehub/datasets/trinaghosh346/personal-income-expenditure/versions/1"),
    "cihannl/budgetwise-personal-finance-dataset": Path("/home/mukama/.cache/kagglehub/datasets/cihannl/budgetwise-personal-finance-dataset/versions/1"),
    # Curated clean sources for budget allocation and goals
    "shrinolo/budget-allocation": Path("/home/mukama/.cache/kagglehub/datasets/shrinolo/budget-allocation/versions/1"),
    "shriyashjagtap/indian-personal-finance-and-spending-habits": Path("/home/mukama/.cache/kagglehub/datasets/shriyashjagtap/indian-personal-finance-and-spending-habits/versions/1"),
}


def load_dataset_manifest() -> Dict[str, str]:
    if not DATASET_MANIFEST.exists():
        return {}
    try:
        payload = json.loads(DATASET_MANIFEST.read_text())
        if isinstance(payload, dict):
            return {str(k): str(v) for k, v in payload.items()}
    except json.JSONDecodeError:
        return {}
    return {}


def resolve_dataset_paths() -> Dict[str, Path]:
    manifest = load_dataset_manifest()
    resolved = {}
    for key, default_path in DEFAULT_DATASET_PATHS.items():
        manifest_path = manifest.get(key)
        if manifest_path:
            resolved[key] = Path(manifest_path)
        else:
            resolved[key] = default_path
    return resolved


DATASET_PATHS = resolve_dataset_paths()

TRANSACTION_SOURCES = [
    "entrepreneurlife/personal-finance",
    "bukolafatunde/personal-finance",
    "willianoliveiragibin/financial-wellness",
]

SPENDING_SOURCES = [
    "ismetsemedov/personal-budget-transactions-dataset",
    "mohammedarfathr/budgetwise-personal-finance-dataset",
    "cihannl/budgetwise-personal-finance-dataset",
    "thedevastator/analyzing-credit-card-spending-habits-in-india",
]

BUDGET_SOURCES = [
    "shrinolo/budget-allocation",
    "shriyashjagtap/indian-personal-finance-and-spending-habits",
]

GOAL_SOURCES = [
    "shriyashjagtap/indian-personal-finance-and-spending-habits",
]

STOPWORDS = {
    "the", "and", "for", "with", "from", "this", "that", "to", "in", "on", "at",
    "by", "of", "a", "an", "is", "it", "as", "or", "be", "are", "was", "were",
    "paid", "payment", "transfer", "transaction", "amount", "bill",
    "asdfgh", "xyz123", "misc", "test", "monthly",
    "card", "bank", "debit", "credit", "refund", "adjustment",
}

CATEGORY_ALIASES = {
    "rent": "Rent",
    "mortgage": "Rent",
    "housing": "Rent",
    "utilities": "Utilities",
    "utility": "Utilities",
    "utilties": "Utilities",
    "utlities": "Utilities",
    "electricity": "Utilities",
    "water": "Utilities",
    "gas": "Utilities",
    "internet": "Communication",
    "phone": "Communication",
    "mobile phone": "Communication",
    "groceries": "Food",
    "grocery": "Food",
    "food": "Food",
    "foods": "Food",
    "fod": "Food",
    "foodd": "Food",
    "market": "Food",
    "restaurants": "Eating Out",
    "fast food": "Eating Out",
    "coffee shops": "Eating Out",
    "alcohol & bars": "Eating Out",
    "restuarant": "Eating Out",
    "restaurant": "Eating Out",
    "dining": "Eating Out",
    "coffee": "Coffee",
    "cafe": "Coffee",
    "transport": "Transport",
    "gas & fuel": "Transport",
    "fuel": "Transport",
    "uber/lyft": "Transport",
    "taxi": "Transport",
    "safeboda": "Transport",
    "farasi": "Transport",
    "travel": "Travel",
    "travl": "Travel",
    "traval": "Travel",
    "entertainment": "Entertainment",
    "movies & dvds": "Entertainment",
    "music": "Entertainment",
    "television": "Entertainment",
    "health": "Health",
    "healthcare": "Health",
    "pharmacy": "Health",
    "education": "Education",
    "educaton": "Education",
    "edu": "Education",
    "tuition": "Education",
    "shopping": "Shopping",
    "merchandise": "Shopping",
    "electronics & software": "Shopping",
    "home improvement": "Shopping",
    "clothing": "Shopping",
    "insurance": "Insurance",
    "auto insurance": "Insurance",
    "savings": "Savings",
    "saving": "Savings",
    "credit card payment": "Debt Payments",
    "loan_repayment": "Debt Payments",
    "loan repayment": "Debt Payments",
    "paycheck": "Income",
    "salary": "Income",
    "direct deposit": "Income",
    "freelance": "Income",
    "bonus": "Income",
    "other": "Miscellaneous",
    "others": "Miscellaneous",
    "misc": "Miscellaneous",
    "bills": "Utilities",
    "merchandise": "Shopping",
    "wire transfer": "Income",
    "grocery": "Food",
    "movies & dvds": "Entertainment",
    "mortgage & rent": "Rent",
    "entertain": "Entertainment",
    "entrtnmnt": "Entertainment",
    "helth": "Health",
    "rnt": "Rent",
}

ALLOWED_CATEGORIES = {
    "Rent",
    "Utilities",
    "Food",
    "Eating Out",
    "Education",
    "Communication",
    "Clothing",
    "Entertainment",
    "Personal Care",
    "Savings",
    "Gifts / Donations",
    "Insurance",
    "Debt Payments",
    "Miscellaneous",
    "Coffee",
    "Dining",
    "Shopping",
    "Tech",
    "Transport",
    "Health",
    "Income",
    "Housing",
    "Travel",
}

MIN_AMOUNT = 1.0
MAX_AMOUNT = 5_000_000_000.0
MIN_DESC_TOKENS = 1
RANDOM_SEED = 42
MIN_CATEGORY_COUNT = 55
MAX_CATEGORY_COUNT = 400
MIN_SPENDING_CATEGORY_COUNT = 80
MIN_SPENDING_MONTHS = 6
GENERIC_TOKENS = {
    "online",
    "course",
    "membership",
    "subscription",
    "deposit",
    "withdrawal",
    "transfer",
    "charge",
    "charges",
    "purchase",
    "purchased",
    "payment",
    "pay",
    "monthly",
    "recurring",
    "auto",
}

ANOMALY_THRESHOLD_SCALE = 1.0

STRONG_TOKENS = {
    "amazon",
    "mortgage",
    "rent",
    "landlord",
    "salary",
    "paycheck",
    "bonus",
    "taxi",
    "uber",
    "lyft",
    "flight",
    "airline",
    "hotel",
    "airbnb",
    "restaurant",
    "kfc",
    "mcdonald",
    "pizza",
    "coffee",
    "cafe",
    "grocery",
    "supermarket",
    "pharmacy",
    "doctor",
    "hospital",
    "clinic",
    "electricity",
    "water",
    "gas",
    "internet",
    "insurance",
    "loan",
    "credit",
    "gym",
    "netflix",
    "spotify",
    "repayment",
    "debt",
    "utilities",
    "fuel",
    "shell",
    "starbucks",
    "brewing",
    "tavern",
}

# Curated extra keywords per category to expand vocabulary beyond training data
CURATED_EXTRA_KEYWORDS: Dict[str, List[str]] = {
    "Rent": ["rent", "landlord", "lease", "apartment", "accommodation", "housing", "mortgage", "room", "premises"],
    "Utilities": ["umeme", "nwsc", "yaka", "electricity", "water", "power", "bill", "utility", "prepaid", "postpaid", "meter"],
    "Food": ["grocery", "supermarket", "market", "beans", "rice", "maize", "flour", "oil", "sugar", "vegetables", "fruits", "walmart", "tesco", "nakumatt", "shoprite", "tuskys"],
    "Eating Out": ["restaurant", "cafe", "kfc", "mcdonald", "pizza", "burger", "takeaway", "delivery", "dining", "lunch", "dinner", "breakfast", "chicken", "chips", "junk", "canteen", "hotel_meal", "catering"],
    "Coffee": ["coffee", "cafe", "espresso", "latte", "cappuccino", "starbucks", "java", "barista", "tea", "brew"],
    "Transport": ["uber", "bolt", "taxi", "boda", "bodaboda", "safeboda", "matatu", "farasi", "fuel", "petrol", "gas_station", "shell", "total", "chevron", "parking", "toll", "bus", "train", "airline", "flight", "booking"],
    "Communication": ["airtime", "data", "bundle", "mtn", "airtel", "africell", "lycamobile", "topup", "top_up", "mobile", "sim", "internet", "broadband", "wifi", "phone", "calling"],
    "Health": ["pharmacy", "clinic", "hospital", "doctor", "medicine", "drugs", "lab", "checkup", "gym", "fitness", "medical", "health", "insurance_health", "diagnosis"],
    "Education": ["school", "fees", "tuition", "university", "college", "books", "stationery", "exam", "registration", "semester", "course", "training", "workshop"],
    "Shopping": ["amazon", "ebay", "mall", "store", "retail", "clothing", "shoes", "electronics", "hardware", "target", "best_buy", "jumia", "konga", "alibaba"],
    "Entertainment": ["netflix", "spotify", "movie", "cinema", "concert", "game", "gaming", "streaming", "showmax", "youtube", "disney", "prime_video", "theater", "music"],
    "Insurance": ["insurance", "premium", "policy", "claim", "auto_insurance", "health_insurance", "life_insurance"],
    "Debt Payments": ["loan", "repayment", "debt", "emi", "installment", "credit_card", "overdraft", "borrow", "lending", "saccos", "mobile_money_loan"],
    "Savings": ["savings", "deposit", "fixed", "investment", "village_savings", "vsla", "piggy", "emergency_fund"],
    "Gifts / Donations": ["donation", "charity", "church", "tithe", "offering", "gift", "send_money", "remittance", "mpesa", "mobile_money", "send", "received_money"],
    "Income": ["salary", "paycheck", "wage", "bonus", "freelance", "refund", "dividend", "interest", "stipend", "allowance", "payment_received", "deposit_income", "payroll"],
    "Personal Care": ["salon", "barber", "haircut", "spa", "cosmetics", "toiletries", "skincare", "grooming", "beauty"],
    "Travel": ["flight", "airline", "hotel", "airbnb", "booking", "vacation", "trip", "tourism", "visa", "passport", "lodging"],
    "Tech": ["software", "subscription", "saas", "app", "apple", "microsoft", "google_play", "antivirus", "cloud", "hosting", "domain"],
    "Miscellaneous": ["other", "misc", "miscellaneous", "unknown", "cash", "withdrawal", "atm"],
}


def normalize_description(raw: str) -> str:
    if not raw:
        return ""
    text = re.sub(r"\s+", " ", str(raw)).strip()
    return text


def is_english_like(text: str) -> bool:
    if not text:
        return False
    ascii_chars = sum(1 for ch in text if ord(ch) < 128)
    ratio = ascii_chars / max(len(text), 1)
    return ratio >= 0.9


def is_valid_amount(value: float) -> bool:
    return MIN_AMOUNT <= value <= MAX_AMOUNT


def balance_categories(df: pd.DataFrame) -> pd.DataFrame:
    if df.empty or "category" not in df.columns:
        return df
    counts = df["category"].value_counts()
    keep_categories = counts[counts >= MIN_CATEGORY_COUNT].index.tolist()
    df = df[df["category"].isin(keep_categories)]
    if df.empty:
        return df
    balanced = []
    rng = np.random.default_rng(RANDOM_SEED)
    for category, group in df.groupby("category"):
        if len(group) > MAX_CATEGORY_COUNT:
            indices = rng.choice(group.index.to_numpy(), size=MAX_CATEGORY_COUNT, replace=False)
            balanced.append(group.loc[indices])
        else:
            balanced.append(group)
    return pd.concat(balanced, ignore_index=True)


def clip_outliers(series: pd.Series, lower_q: float = 0.01, upper_q: float = 0.99) -> pd.Series:
    if series.empty:
        return series
    lower = series.quantile(lower_q)
    upper = series.quantile(upper_q)
    return series.clip(lower=lower, upper=upper)


def build_token_weights(
    token_counts: Dict[str, Dict[str, int]],
    min_count: int = 2,
    top_n: int = 60,
) -> Dict[str, Dict[str, float]]:
    if not token_counts:
        return {}
    categories = list(token_counts.keys())
    num_categories = len(categories)
    token_df: Dict[str, int] = {}
    category_totals: Dict[str, int] = {}
    for category, tokens in token_counts.items():
        category_totals[category] = sum(tokens.values()) or 1
        for token in tokens.keys():
            token_df[token] = token_df.get(token, 0) + 1

    weights: Dict[str, Dict[str, float]] = {}
    for category, tokens in token_counts.items():
        scored = []
        for token, count in tokens.items():
            if count < min_count or token in GENERIC_TOKENS:
                continue
            if token_df.get(token, 0) >= 3 and token not in STRONG_TOKENS:
                continue
            tf = count / category_totals[category]
            df = token_df.get(token, 1)
            idf = math.log((1 + num_categories) / (1 + df)) + 1
            scored.append((token, tf * idf))
        scored.sort(key=lambda item: item[1], reverse=True)
        weights[category] = {token: round(score, 4) for token, score in scored[:top_n]}
    return weights


def select_top_tokens(token_weights: Dict[str, Dict[str, float]], top_n: int = 25) -> Dict[str, List[str]]:
    keywords: Dict[str, List[str]] = {}
    for category, weights in token_weights.items():
        sorted_tokens = sorted(weights.items(), key=lambda item: item[1], reverse=True)
        keywords[category] = [token for token, _ in sorted_tokens[:top_n]]
    return keywords


def normalize_category(raw: str) -> str:
    if not raw:
        return "Miscellaneous"
    key = re.sub(r"[^a-z0-9\s_&/-]", "", str(raw).lower()).strip()
    key = key.replace("_", " ").replace("-", " ")
    key = re.sub(r"\s+", " ", key)
    if key in CATEGORY_ALIASES:
        return CATEGORY_ALIASES[key]
    for alias, target in CATEGORY_ALIASES.items():
        if key.startswith(alias):
            return target
    return str(raw).strip().title()


def tokenize(text: str) -> List[str]:
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    tokens = [
        t
        for t in text.split()
        if len(t) > 2 and t not in STOPWORDS and not any(ch.isdigit() for ch in t)
    ]
    return tokens


def add_ngrams(tokens: List[str], n: int = 2) -> List[str]:
    if len(tokens) < n:
        return []
    return ["_".join(tokens[i:i + n]) for i in range(len(tokens) - n + 1)]


def safe_read_csv(path: Path) -> Optional[pd.DataFrame]:
    try:
        return pd.read_csv(path)
    except Exception:
        try:
            return pd.read_csv(path, sep="\t")
        except Exception:
            return None


def safe_read_table(path: Path) -> Optional[pd.DataFrame]:
    if path.suffix.lower() in {".xlsx", ".xls"}:
        try:
            return pd.read_excel(path)
        except Exception:
            return None
    return safe_read_csv(path)


def write_ts_module(path: Path, content: str) -> None:
    path.write_text(content, encoding="utf-8")


def write_json(path: Path, payload: Dict) -> None:
    path.write_text(json.dumps(payload, indent=2, sort_keys=True), encoding="utf-8")


def write_training_metadata() -> None:
    payload = (
        "export const trainedDatasetSources = "
        + repr(
            {
                "transactions": TRANSACTION_SOURCES,
                "spending": SPENDING_SOURCES,
                "budget_allocator": BUDGET_SOURCES,
                "goal_predictor": GOAL_SOURCES,
            }
        )
        + " as const;\n"
        + "export const trainedDatasetFilters = "
        + repr(
            {
                "allowed_categories": sorted(ALLOWED_CATEGORIES),
                "min_amount": MIN_AMOUNT,
                "max_amount": MAX_AMOUNT,
                "min_description_tokens": MIN_DESC_TOKENS,
                "english_like_ratio": 0.9,
                "min_category_count": MIN_CATEGORY_COUNT,
                "max_category_count": MAX_CATEGORY_COUNT,
                "min_spending_category_count": MIN_SPENDING_CATEGORY_COUNT,
                "min_spending_months": MIN_SPENDING_MONTHS,
            }
        )
        + " as const;\n"
        + "export const trainedDatasetTimestamp = "
        + repr(datetime.now(timezone.utc).isoformat())
        + " as const;\n"
    )
    write_ts_module(ARTIFACTS_DIR / "training-metadata.ts", payload)


def time_split(df: pd.DataFrame, date_col: str, test_frac: float = 0.2) -> tuple[pd.DataFrame, pd.DataFrame]:
    if df.empty or date_col not in df.columns:
        return df, df
    df = df.dropna(subset=[date_col]).sort_values(date_col)
    if df.empty:
        return df, df
    cutoff = int(len(df) * (1 - test_frac))
    return df.iloc[:cutoff].copy(), df.iloc[cutoff:].copy()


def random_split(df: pd.DataFrame, test_frac: float = 0.2, seed: int = 42) -> tuple[pd.DataFrame, pd.DataFrame]:
    if df.empty:
        return df, df
    rng = np.random.default_rng(seed)
    indices = np.arange(len(df))
    rng.shuffle(indices)
    cutoff = int(len(df) * (1 - test_frac))
    train_idx = indices[:cutoff]
    test_idx = indices[cutoff:]
    return df.iloc[train_idx].copy(), df.iloc[test_idx].copy()


def safe_div(numerator: float, denominator: float) -> float:
    return numerator / denominator if denominator else 0.0


def f1_metrics(y_true: List[str], y_pred: List[str]) -> Dict[str, float]:
    labels = sorted(set(y_true) | set(y_pred))
    if not labels:
        return {"macro_f1": 0.0, "weighted_f1": 0.0}
    f1_scores = []
    weighted_scores = []
    total = len(y_true)
    for label in labels:
        tp = sum(1 for yt, yp in zip(y_true, y_pred) if yt == label and yp == label)
        fp = sum(1 for yt, yp in zip(y_true, y_pred) if yt != label and yp == label)
        fn = sum(1 for yt, yp in zip(y_true, y_pred) if yt == label and yp != label)
        precision = safe_div(tp, tp + fp)
        recall = safe_div(tp, tp + fn)
        f1 = safe_div(2 * precision * recall, precision + recall)
        support = sum(1 for yt in y_true if yt == label)
        f1_scores.append(f1)
        weighted_scores.append(f1 * support)
    macro_f1 = sum(f1_scores) / len(f1_scores)
    weighted_f1 = safe_div(sum(weighted_scores), total)
    return {"macro_f1": round(macro_f1, 4), "weighted_f1": round(weighted_f1, 4)}


def build_confusion_matrix(y_true: List[str], y_pred: List[str], top_n: int = 10) -> Dict[str, Dict[str, int]]:
    labels = sorted(set(y_true) | set(y_pred))
    counts = {label: 0 for label in labels}
    for label in y_true:
        counts[label] = counts.get(label, 0) + 1
    top_labels = {label for label, _ in sorted(counts.items(), key=lambda item: item[1], reverse=True)[:top_n]}
    matrix: Dict[str, Dict[str, int]] = {}
    for yt, yp in zip(y_true, y_pred):
        if yt not in top_labels:
            yt = "Other"
        if yp not in top_labels:
            yp = "Other"
        matrix.setdefault(yt, {})
        matrix[yt][yp] = matrix[yt].get(yp, 0) + 1
    return matrix


def build_transaction_dataset() -> pd.DataFrame:
    records = []
    sources = [
        {
            "path": DATASET_PATHS["entrepreneurlife/personal-finance"] / "personal_transactions_dashboard_ready (2).xlsx",
            "map": {"date": "Date", "description": "Description", "amount": "Amount", "category": "Category", "type": "Transaction Type"},
        },
        {
            "path": DATASET_PATHS["bukolafatunde/personal-finance"] / "personal_transactions.csv",
            "map": {"date": "Date", "description": "Description", "amount": "Amount", "category": "Category", "type": "Transaction Type"},
        },
        {
            "path": DATASET_PATHS["willianoliveiragibin/financial-wellness"] / "personal_transactions new.csv",
            "map": {"date": "Date", "description": "Description", "amount": "Amount", "category": "Category", "type": "Transaction Type"},
        },
    ]

    for source in sources:
        df = safe_read_table(source["path"])
        if df is None:
            continue
        mapping = source["map"]
        required = ["date", "description", "amount", "category"]
        cols = {key: mapping.get(key) for key in ["date", "description", "amount", "category", "type"] if mapping.get(key) in df.columns}
        if not all(c in cols for c in required):
            continue
        subset = df[[cols[c] for c in cols]].rename(columns={v: k for k, v in cols.items()})
        subset = subset.loc[:, ~subset.columns.duplicated()]
        # Normalize: no coercing missing to defaults — reject invalid rows
        subset["description"] = subset["description"].astype(str).map(normalize_description)
        subset["category"] = subset["category"].astype(str).str.strip()
        subset = subset.loc[subset["category"].str.len() > 0]
        subset["category"] = subset["category"].apply(normalize_category)
        subset["amount"] = pd.to_numeric(subset["amount"], errors="coerce")
        subset["date"] = pd.to_datetime(subset["date"], errors="coerce")
        if "type" in subset.columns:
            subset["type"] = subset["type"].fillna("expense").astype(str)
        else:
            subset["type"] = "expense"
        # Reject rows that fail required schema (do not coerce)
        subset = subset.dropna(subset=["date", "amount"])
        subset = subset.loc[subset["amount"].abs().map(is_valid_amount)]
        subset = subset.loc[subset["category"].isin(ALLOWED_CATEGORIES)]
        subset = subset.loc[subset["description"].map(is_english_like)]
        subset = subset.loc[subset["description"].str.split().str.len() >= MIN_DESC_TOKENS]
        records.append(subset)

    if not records:
        return pd.DataFrame(columns=["date", "description", "amount", "category", "type"])
    combined = pd.concat(records, ignore_index=True)
    combined = balance_categories(combined)
    return combined


def train_transaction_categorizer(df: pd.DataFrame) -> str:
    if df.empty:
        return (
            "export const trainedCategoryKeywords = {} as const;\\n"
            "export const trainedCategoryTokenWeights = {} as const;\\n"
            "export const trainedCategoryWeights = {} as const;\\n"
            "export const trainedCategoryPriors = {} as const;\\n"
        )

    df = df.copy()
    df["category"] = df["category"].str.strip().str.title()
    df["tokens"] = df["description"].fillna("").astype(str).apply(tokenize)
    category_counts = df["category"].value_counts().to_dict()
    valid_categories = {cat for cat, count in category_counts.items() if count >= 25}
    total = sum(category_counts.values())
    priors = {cat: count / total for cat, count in category_counts.items() if cat in valid_categories}

    token_counts: Dict[str, Dict[str, int]] = {}
    amount_stats: Dict[str, List[float]] = {}
    for _, row in df.iterrows():
        category = row["category"]
        if category not in valid_categories:
            continue
        amount = float(abs(row["amount"]))
        amount_stats.setdefault(category, []).append(amount)
        token_counts.setdefault(category, {})
        tokens = row["tokens"]
        for token in tokens + add_ngrams(tokens):
            token_counts[category][token] = token_counts[category].get(token, 0) + 1

    keywords = {}
    weights = {}
    token_weights = build_token_weights(token_counts, min_count=2, top_n=120)
    keywords = select_top_tokens(token_weights, top_n=50)

    for category, tokens in token_counts.items():

        amounts = amount_stats.get(category, [])
        if amounts:
            avg_amount = float(np.mean(amounts))
            amount_weight = min(max(avg_amount / 100000, 0.1), 0.7)
            weights[category] = {
                "amount": round(amount_weight, 3),
                "isLarge": 0.6 if avg_amount > 10000 else 0.2,
                "isSmall": 0.6 if avg_amount < 1000 else 0.2,
                "isMedium": 0.4,
            }

    # Merge curated extra keywords and token weights so categorizer has more vocabulary
    for cat, extra_tokens in CURATED_EXTRA_KEYWORDS.items():
        normalized_extra = [
            re.sub(r"[^a-z0-9_]", "_", t.lower()).strip("_").replace("__", "_")
            for t in extra_tokens
            if len(t) > 2
        ]
        normalized_extra = [t for t in normalized_extra if t and t not in STOPWORDS]
        if not normalized_extra:
            continue
        if cat not in keywords:
            keywords[cat] = []
        existing_set = set(keywords[cat])
        for token in normalized_extra:
            if token not in existing_set:
                keywords[cat].append(token)
                existing_set.add(token)
        if cat not in token_weights:
            token_weights[cat] = {}
        # Assign a modest weight so curated words influence prediction
        cur_weight = 0.15
        for token in normalized_extra:
            if token not in token_weights[cat]:
                token_weights[cat][token] = round(cur_weight, 4)
                cur_weight = max(0.05, cur_weight - 0.005)

    # Ensure every category that has keywords/token_weights also has weights and priors
    # so the frontend scores them and words reflect their respective categories
    default_weight = {"amount": 0.1, "isLarge": 0.2, "isSmall": 0.6, "isMedium": 0.4}
    all_categories = set(keywords.keys()) | set(token_weights.keys())
    for cat in all_categories:
        if cat not in weights:
            weights[cat] = default_weight.copy()
    # Add small prior for categories not in dataset so they are considered in scoring
    num_all = len(all_categories)
    small_prior = 0.01
    for cat in all_categories:
        if cat not in priors:
            priors[cat] = small_prior
    # Renormalize priors to sum to 1
    total_prior = sum(priors.values())
    if total_prior > 0:
        priors = {k: round(v / total_prior, 10) for k, v in priors.items()}

    content = (
        "export const trainedCategoryKeywords = "
        + repr(keywords)
        + " as const;\n"
        + "export const trainedCategoryTokenWeights = "
        + repr(token_weights)
        + " as const;\n"
        + "export const trainedCategoryWeights = "
        + repr(weights)
        + " as const;\n"
        + "export const trainedCategoryPriors = "
        + repr(priors)
        + " as const;\n"
    )
    return content


def build_categorizer_model(
    df: pd.DataFrame,
) -> tuple[Dict[str, Dict[str, float]], Dict[str, Dict[str, float]], Dict[str, float]]:
    if df.empty:
        return {}, {}, {}
    df = df.copy()
    df["category"] = df["category"].str.strip().str.title()
    df["tokens"] = df["description"].fillna("").astype(str).apply(tokenize)
    category_counts = df["category"].value_counts().to_dict()
    valid_categories = {cat for cat, count in category_counts.items() if count >= 25}
    total = sum(category_counts.values())
    priors = {cat: count / total for cat, count in category_counts.items() if cat in valid_categories}

    token_counts: Dict[str, Dict[str, int]] = {}
    amount_stats: Dict[str, List[float]] = {}
    for _, row in df.iterrows():
        category = row["category"]
        if category not in valid_categories:
            continue
        amount = float(abs(row["amount"]))
        amount_stats.setdefault(category, []).append(amount)
        token_counts.setdefault(category, {})
        tokens = row["tokens"]
        for token in tokens + add_ngrams(tokens):
            token_counts[category][token] = token_counts[category].get(token, 0) + 1

    keywords = {}
    weights = {}
    token_weights = build_token_weights(token_counts, min_count=2, top_n=120)
    keywords = select_top_tokens(token_weights, top_n=50)

    for category, tokens in token_counts.items():

        amounts = amount_stats.get(category, [])
        if amounts:
            avg_amount = float(np.mean(amounts))
            amount_weight = min(max(avg_amount / 100000, 0.1), 0.7)
            weights[category] = {
                "amount": round(amount_weight, 3),
                "isLarge": 0.6 if avg_amount > 10000 else 0.2,
                "isSmall": 0.6 if avg_amount < 1000 else 0.2,
                "isMedium": 0.4,
            }

    # Merge curated extra keywords/weights for build_categorizer_model (e.g. evaluation)
    for cat, extra_tokens in CURATED_EXTRA_KEYWORDS.items():
        normalized_extra = [
            re.sub(r"[^a-z0-9_]", "_", t.lower()).strip("_").replace("__", "_")
            for t in extra_tokens
            if len(t) > 2
        ]
        normalized_extra = [t for t in normalized_extra if t and t not in STOPWORDS]
        if not normalized_extra:
            continue
        if cat not in token_weights:
            token_weights[cat] = {}
        cur_weight = 0.15
        for token in normalized_extra:
            if token not in token_weights[cat]:
                token_weights[cat][token] = round(cur_weight, 4)
                cur_weight = max(0.05, cur_weight - 0.005)

    return token_weights, weights, priors


def predict_category(
    description: str,
    amount: float,
    token_weights: Dict[str, Dict[str, float]],
    weights: Dict[str, Dict[str, float]],
    priors: Dict[str, float],
) -> str:
    tokens = tokenize(description)
    tokens = tokens + add_ngrams(tokens)
    is_large = abs(amount) > 10000
    is_small = abs(amount) < 1000
    is_medium = not is_large and not is_small
    scores: Dict[str, float] = {}
    categories = set(token_weights.keys()) | set(priors.keys())
    for category in categories:
        score = math.log(priors.get(category, 1e-6))
        weights_for_category = token_weights.get(category, {})
        if weights_for_category:
            match_score = sum(weights_for_category.get(token, 0) for token in tokens)
            score += match_score
        w = weights.get(category, {})
        if "amount" in w:
            score += w["amount"] * min(abs(amount) / 100000, 1)
        if is_large:
            score += w.get("isLarge", 0)
        if is_small:
            score += w.get("isSmall", 0)
        if is_medium:
            score += w.get("isMedium", 0)
        scores[category] = score
    if not scores:
        return "Miscellaneous"
    return max(scores.items(), key=lambda item: item[1])[0]


def top_k_categories(
    description: str,
    amount: float,
    token_weights: Dict[str, Dict[str, float]],
    weights: Dict[str, Dict[str, float]],
    priors: Dict[str, float],
    k: int = 3,
) -> List[str]:
    tokens = tokenize(description)
    tokens = tokens + add_ngrams(tokens)
    is_large = abs(amount) > 10000
    is_small = abs(amount) < 1000
    is_medium = not is_large and not is_small
    scores: Dict[str, float] = {}
    categories = set(token_weights.keys()) | set(priors.keys())
    for category in categories:
        score = math.log(priors.get(category, 1e-6))
        weights_for_category = token_weights.get(category, {})
        if weights_for_category:
            match_score = sum(weights_for_category.get(token, 0) for token in tokens)
            score += match_score
        w = weights.get(category, {})
        if "amount" in w:
            score += w["amount"] * min(abs(amount) / 100000, 1)
        if is_large:
            score += w.get("isLarge", 0)
        if is_small:
            score += w.get("isSmall", 0)
        if is_medium:
            score += w.get("isMedium", 0)
        scores[category] = score
    return [cat for cat, _ in sorted(scores.items(), key=lambda item: item[1], reverse=True)[:k]]


def build_spending_dataset() -> pd.DataFrame:
    records = []
    sources = [
        {
            "path": DATASET_PATHS["ismetsemedov/personal-budget-transactions-dataset"] / "budget_data.csv",
            "map": {"date": "date", "category": "category", "amount": "amount"},
        },
        {
            "path": DATASET_PATHS["ismetsemedov/personal-budget-transactions-dataset"] / "11 march 2025.csv",
            "map": {"date": "date", "category": "category", "amount": "amount"},
        },
        {
            "path": DATASET_PATHS["ismetsemedov/personal-budget-transactions-dataset"] / "budjet (2).csv",
            "map": {"date": "date", "category": "category", "amount": "amount"},
        },
        {
            "path": DATASET_PATHS["mohammedarfathr/budgetwise-personal-finance-dataset"] / "budgetwise_finance_dataset.csv",
            "map": {"date": "date", "category": "category", "amount": "amount"},
        },
        {
            "path": DATASET_PATHS["cihannl/budgetwise-personal-finance-dataset"] / "budgetwise_finance_dataset.csv",
            "map": {"date": "date", "category": "category", "amount": "amount"},
        },
        {
            "path": DATASET_PATHS["thedevastator/analyzing-credit-card-spending-habits-in-india"] / "Credit card transactions - India - Simple.csv",
            "map": {"date": "Date", "category": "Exp Type", "amount": "Amount"},
        },
    ]

    for source in sources:
        df = safe_read_csv(source["path"])
        if df is None:
            continue
        mapping = source["map"]
        if not all(mapping[k] in df.columns for k in ["date", "category", "amount"]):
            continue
        subset = df[[mapping["date"], mapping["category"], mapping["amount"]]].rename(
            columns={mapping["date"]: "date", mapping["category"]: "category", mapping["amount"]: "amount"}
        )
        subset["date"] = pd.to_datetime(subset["date"], errors="coerce")
        subset["amount"] = pd.to_numeric(subset["amount"], errors="coerce")
        subset["category"] = subset["category"].astype(str).str.strip()
        subset = subset.loc[subset["category"].str.len() > 0]
        subset["category"] = subset["category"].apply(normalize_category)
        # Reject rows that fail required schema (do not coerce)
        subset = subset.dropna(subset=["date", "amount"])
        subset = subset.loc[subset["amount"].abs().map(is_valid_amount)]
        subset = subset.loc[subset["category"].isin(ALLOWED_CATEGORIES)]
        records.append(subset)

    if not records:
        return pd.DataFrame(columns=["date", "category", "amount"])
    df = pd.concat(records, ignore_index=True)
    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    df = df.dropna(subset=["date"])
    df["amount"] = df["amount"].abs()
    df["amount"] = clip_outliers(df["amount"])
    counts = df["category"].value_counts()
    keep_categories = counts[counts >= MIN_SPENDING_CATEGORY_COUNT].index.tolist()
    df = df[df["category"].isin(keep_categories)]
    if df.empty:
        return df
    df["month"] = df["date"].dt.to_period("M").astype(str)
    month_counts = df.groupby("category")["month"].nunique()
    keep_categories = month_counts[month_counts >= MIN_SPENDING_MONTHS].index.tolist()
    df = df[df["category"].isin(keep_categories)]
    return df.drop(columns=["month"])


def train_spending_forecaster(df: pd.DataFrame) -> str:
    if df.empty:
        return "export const trainedSeasonality = {} as const;\\nexport const trainedAverages = {} as const;\\n"

    df = df.dropna(subset=["date"]).copy()
    df["month"] = df["date"].dt.month
    df["amount"] = df["amount"].abs()

    seasonal = {}
    averages = {}
    for category, group in df.groupby("category"):
        monthly = group.groupby("month")["amount"].mean()
        overall = monthly.mean() if not monthly.empty else 0
        if overall > 0:
            seasonal[category] = {int(month): round(float(val / overall), 3) for month, val in monthly.items()}
        averages[category] = round(float(group["amount"].mean() * 30), 2)

    content = (
        "export const trainedSeasonality = "
        + repr(seasonal)
        + " as const;\n"
        + "export const trainedAverages = "
        + repr(averages)
        + " as const;\n"
    )
    return content


def train_budget_allocator() -> str:
    shares = {}

    # Budget allocation dataset
    for name in ["rural_budget_allocation_dataset.csv", "urban_budget_allocation_dataset.csv"]:
        path = DATASET_PATHS["shrinolo/budget-allocation"] / name
        df = safe_read_csv(path)
        if df is None:
            continue
        budget_cols = [col for col in df.columns if col.endswith("Budget")]
        for _, row in df.iterrows():
            total = sum(row.get(col, 0) for col in budget_cols)
            if total <= 0:
                continue
            for col in budget_cols:
                category = normalize_category(col.replace("Budget", ""))
                shares.setdefault(category, []).append(float(row.get(col, 0)) / total)

    # Personal finance spending habits dataset
    habits_path = DATASET_PATHS["shriyashjagtap/indian-personal-finance-and-spending-habits"] / "data.csv"
    habits = safe_read_csv(habits_path)
    if habits is not None:
        spend_cols = [
            "Rent", "Loan_Repayment", "Insurance", "Groceries", "Transport", "Eating_Out",
            "Entertainment", "Utilities", "Healthcare", "Education", "Miscellaneous",
        ]
        for _, row in habits.iterrows():
            total = sum(float(row.get(col, 0)) for col in spend_cols)
            if total <= 0:
                continue
            for col in spend_cols:
                shares.setdefault(normalize_category(col), []).append(float(row.get(col, 0)) / total)

    average_shares = {cat: round(float(np.mean(vals)), 4) for cat, vals in shares.items() if vals}
    return "export const trainedBudgetShares = " + repr(average_shares) + " as const;\n"


def train_goal_predictor() -> str:
    habits_path = DATASET_PATHS["shriyashjagtap/indian-personal-finance-and-spending-habits"] / "data.csv"
    habits = safe_read_csv(habits_path)
    if habits is None or habits.empty:
        return "export const trainedSavingsRates = {} as const;\n"

    habits["Income"] = pd.to_numeric(habits["Income"], errors="coerce")
    habits["Desired_Savings_Percentage"] = pd.to_numeric(habits.get("Desired_Savings_Percentage"), errors="coerce")
    habits = habits.dropna(subset=["Income", "Desired_Savings_Percentage"])

    bins = [0, 20000, 50000, 100000, 200000, 500000, 1e9]
    labels = ["<20k", "20-50k", "50-100k", "100-200k", "200-500k", "500k+"]
    habits["income_bracket"] = pd.cut(habits["Income"], bins=bins, labels=labels, include_lowest=True)

    rates = {}
    for bracket, group in habits.groupby("income_bracket", observed=True):
        if group.empty:
            continue
        rates[str(bracket)] = round(float(group["Desired_Savings_Percentage"].mean()) / 100.0, 4)

    return "export const trainedSavingsRates = " + repr(rates) + " as const;\n"


def train_anomaly_detector(df: pd.DataFrame) -> str:
    if df.empty:
        return "export const trainedCategoryStats = {} as const;\n"

    stats = {}
    for category, group in df.groupby("category"):
        amounts = group["amount"].abs().dropna().values
        if len(amounts) < 5:
            continue
        median = float(np.median(amounts))
        mad = float(np.median(np.abs(amounts - median)))
        p90 = float(np.percentile(amounts, 90))
        p95 = float(np.percentile(amounts, 95))
        p97 = float(np.percentile(amounts, 97))
        p98 = float(np.percentile(amounts, 98))
        p99 = float(np.percentile(amounts, 99))
        p995 = float(np.percentile(amounts, 99.5))
        stats[category] = {
            "median": round(median, 4),
            "mad": round(mad, 4),
            "p90": round(p90, 4),
            "p95": round(p95, 4),
            "p97": round(p97, 4),
            "p98": round(p98, 4),
            "p99": round(p99, 4),
            "p995": round(p995, 4),
            "count": int(len(amounts)),
        }

    return "export const trainedCategoryStats = " + repr(stats) + " as const;\n"


def export_clean_datasets(model: str, output_dir: Path) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    if model in ("transaction_categorizer", "anomaly_detector"):
        transactions = build_transaction_dataset()
        if not transactions.empty:
            transactions.to_csv(output_dir / "transactions_clean.csv", index=False)
        return
    if model == "spending_forecaster":
        spending = build_spending_dataset()
        if not spending.empty:
            spending.to_csv(output_dir / "spending_clean.csv", index=False)
        return
    if model == "budget_allocator":
        rows = build_budget_share_rows()
        if rows:
            pd.DataFrame(rows).to_csv(output_dir / "budget_shares_clean.csv", index=False)
        return
    if model == "goal_predictor":
        habits_path = DATASET_PATHS["shriyashjagtap/indian-personal-finance-and-spending-habits"] / "data.csv"
        habits = safe_read_csv(habits_path)
        if habits is not None and not habits.empty:
            subset = habits[["Income", "Desired_Savings_Percentage"]].copy()
            subset["Income"] = pd.to_numeric(subset["Income"], errors="coerce")
            subset["Desired_Savings_Percentage"] = pd.to_numeric(
                subset["Desired_Savings_Percentage"], errors="coerce"
            )
            subset = subset.dropna()
            if not subset.empty:
                subset.to_csv(output_dir / "goal_savings_clean.csv", index=False)
        return


def run_training(model: str) -> None:
    if model in ("transaction_categorizer", "anomaly_detector", "all"):
        transactions = build_transaction_dataset()
    else:
        transactions = pd.DataFrame()

    if model in ("spending_forecaster", "all"):
        spending = build_spending_dataset()
    else:
        spending = pd.DataFrame()

    if model in ("transaction_categorizer", "all"):
        categorizer_content = train_transaction_categorizer(transactions)
        write_ts_module(ARTIFACTS_DIR / "transaction-categorizer.ts", categorizer_content)

    if model in ("spending_forecaster", "all"):
        forecaster_content = train_spending_forecaster(spending)
        write_ts_module(ARTIFACTS_DIR / "spending-forecaster.ts", forecaster_content)

    if model in ("budget_allocator", "all"):
        allocator_content = train_budget_allocator()
        write_ts_module(ARTIFACTS_DIR / "budget-allocator.ts", allocator_content)

    if model in ("goal_predictor", "all"):
        goal_content = train_goal_predictor()
        write_ts_module(ARTIFACTS_DIR / "goal-predictor.ts", goal_content)

    if model in ("anomaly_detector", "all"):
        anomaly_content = train_anomaly_detector(transactions)
        write_ts_module(ARTIFACTS_DIR / "anomaly-detector.ts", anomaly_content)

    if model == "all":
        write_training_metadata()

        report = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "dataset_sources": {
                "transactions": TRANSACTION_SOURCES,
                "spending": SPENDING_SOURCES,
                "budget_allocator": BUDGET_SOURCES,
                "goal_predictor": GOAL_SOURCES,
            },
            "filters": {
                "allowed_categories": sorted(ALLOWED_CATEGORIES),
                "min_amount": MIN_AMOUNT,
                "max_amount": MAX_AMOUNT,
                "min_description_tokens": MIN_DESC_TOKENS,
                "english_like_ratio": 0.9,
                "min_category_count": MIN_CATEGORY_COUNT,
                "max_category_count": MAX_CATEGORY_COUNT,
                "min_spending_category_count": MIN_SPENDING_CATEGORY_COUNT,
                "min_spending_months": MIN_SPENDING_MONTHS,
            },
            "datasets": {
                "transactions_rows": int(len(transactions)),
                "spending_rows": int(len(spending)),
            },
            "metrics": {
                "transaction_categorizer": evaluate_transaction_categorizer(transactions),
                "spending_forecaster": evaluate_spending_forecaster(spending),
                "budget_allocator": evaluate_budget_allocator(),
                "goal_predictor": evaluate_goal_predictor(),
                "anomaly_detector": evaluate_anomaly_detector(transactions),
            },
        }
        write_json(REPORTS_DIR / "latest.json", report)
        print("Report written to:", REPORTS_DIR / "latest.json")
        try:
            import importlib.util
            spec = importlib.util.spec_from_file_location(
                "report_visuals", REPORTS_DIR.parent / "report_visuals.py"
            )
            mod = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(mod)
            mod.main()
        except Exception as e:
            print("Visual report skipped:", e)

    print("Artifacts written to:", ARTIFACTS_DIR)


def evaluate_transaction_categorizer(df: pd.DataFrame) -> Dict:
    train_df, test_df = time_split(df, "date", test_frac=0.2)
    if test_df.empty:
        return {"samples": 0, "macro_f1": 0.0, "weighted_f1": 0.0, "top3_accuracy": 0.0}
    token_weights, weights, priors = build_categorizer_model(train_df)
    y_true = test_df["category"].astype(str).str.title().tolist()
    y_pred = [
        predict_category(desc, amt, token_weights, weights, priors)
        for desc, amt in zip(test_df["description"].astype(str), test_df["amount"].astype(float))
    ]
    top3 = [
        top_k_categories(desc, amt, token_weights, weights, priors, k=3)
        for desc, amt in zip(test_df["description"].astype(str), test_df["amount"].astype(float))
    ]
    top3_hits = sum(1 for yt, preds in zip(y_true, top3) if yt in preds)
    metrics = f1_metrics(y_true, y_pred)
    return {
        "samples": len(y_true),
        "macro_f1": metrics["macro_f1"],
        "weighted_f1": metrics["weighted_f1"],
        "top3_accuracy": round(safe_div(top3_hits, len(y_true)), 4),
        "confusion_matrix": build_confusion_matrix(y_true, y_pred, top_n=8),
    }


def evaluate_spending_forecaster(df: pd.DataFrame) -> Dict:
    train_df, test_df = time_split(df, "date", test_frac=0.2)
    if test_df.empty:
        return {"samples": 0, "mae": 0.0, "mape": 0.0, "directional_accuracy": 0.0}
    train_df = train_df.dropna(subset=["date"]).copy()
    train_df["month"] = train_df["date"].dt.month
    train_df["amount"] = train_df["amount"].abs()
    trained_seasonality = {}
    trained_averages = {}
    for category, group in train_df.groupby("category"):
        monthly = group.groupby("month")["amount"].mean()
        overall = monthly.mean() if not monthly.empty else 0
        if overall > 0:
            trained_seasonality[category] = {int(month): float(val / overall) for month, val in monthly.items()}
        trained_averages[category] = float(group["amount"].mean() * 30)

    test_df = test_df.dropna(subset=["date"]).copy()
    test_df["month"] = test_df["date"].dt.month
    test_df["amount"] = test_df["amount"].abs()
    monthly = (
        test_df.groupby(["category", "month"])["amount"].sum().reset_index()
    )
    if monthly.empty:
        return {"samples": 0, "mae": 0.0, "mape": 0.0, "directional_accuracy": 0.0}

    errors = []
    ape = []
    directional_hits = []
    total = 0
    for category, group in monthly.groupby("category"):
        group = group.sort_values("month")
        previous_actual = None
        for _, row in group.iterrows():
            month = int(row["month"])
            actual = float(row["amount"])
            base = trained_averages.get(category, 0.0)
            seasonal = trained_seasonality.get(category, {}).get(month, 1.0)
            prediction = base * seasonal
            errors.append(abs(actual - prediction))
            ape.append(abs(actual - prediction) / actual if actual else 0.0)
            if previous_actual is not None:
                predicted_delta = prediction - previous_actual
                actual_delta = actual - previous_actual
                directional_hits.append(
                    (predicted_delta >= 0 and actual_delta >= 0) or (predicted_delta < 0 and actual_delta < 0)
                )
            previous_actual = actual
            total += 1
    return {
        "samples": total,
        "mae": round(float(np.mean(errors)) if errors else 0.0, 4),
        "mape": round(float(np.mean(ape)) if ape else 0.0, 4),
        "directional_accuracy": round(safe_div(sum(directional_hits), len(directional_hits)), 4),
    }


def build_budget_share_rows() -> List[Dict[str, float]]:
    rows: List[Dict[str, float]] = []
    for name in ["rural_budget_allocation_dataset.csv", "urban_budget_allocation_dataset.csv"]:
        path = DATASET_PATHS["shrinolo/budget-allocation"] / name
        df = safe_read_csv(path)
        if df is None:
            continue
        budget_cols = [col for col in df.columns if col.endswith("Budget")]
        for _, row in df.iterrows():
            total = sum(row.get(col, 0) for col in budget_cols)
            if total <= 0:
                continue
            shares = {}
            for col in budget_cols:
                category = normalize_category(col.replace("Budget", ""))
                shares[category] = float(row.get(col, 0)) / total
            rows.append(shares)

    habits_path = DATASET_PATHS["shriyashjagtap/indian-personal-finance-and-spending-habits"] / "data.csv"
    habits = safe_read_csv(habits_path)
    if habits is not None:
        spend_cols = [
            "Rent", "Loan_Repayment", "Insurance", "Groceries", "Transport", "Eating_Out",
            "Entertainment", "Utilities", "Healthcare", "Education", "Miscellaneous",
        ]
        for _, row in habits.iterrows():
            total = sum(float(row.get(col, 0)) for col in spend_cols)
            if total <= 0:
                continue
            shares = {}
            for col in spend_cols:
                shares[normalize_category(col)] = float(row.get(col, 0)) / total
            rows.append(shares)
    return rows


def evaluate_budget_allocator() -> Dict:
    rows = build_budget_share_rows()
    if not rows:
        return {"samples": 0, "rmse": 0.0}
    df = pd.DataFrame(rows).fillna(0)
    train_df, test_df = random_split(df, test_frac=0.2, seed=42)
    if test_df.empty:
        return {"samples": 0, "rmse": 0.0}
    train_avg = train_df.mean().to_dict()
    rmses = []
    for _, row in test_df.iterrows():
        diffs = []
        for category in train_avg.keys():
            pred = train_avg.get(category, 0.0)
            actual = row.get(category, 0.0)
            diffs.append((pred - actual) ** 2)
        rmses.append(math.sqrt(sum(diffs) / len(diffs)) if diffs else 0.0)
    return {
        "samples": len(test_df),
        "rmse": round(float(np.mean(rmses)) if rmses else 0.0, 4),
    }


def evaluate_goal_predictor() -> Dict:
    habits_path = DATASET_PATHS["shriyashjagtap/indian-personal-finance-and-spending-habits"] / "data.csv"
    habits = safe_read_csv(habits_path)
    if habits is None or habits.empty:
        return {"samples": 0, "brier": 0.0, "mae": 0.0}
    habits["Income"] = pd.to_numeric(habits["Income"], errors="coerce")
    habits["Desired_Savings_Percentage"] = pd.to_numeric(habits.get("Desired_Savings_Percentage"), errors="coerce")
    habits = habits.dropna(subset=["Income", "Desired_Savings_Percentage"])
    if habits.empty:
        return {"samples": 0, "brier": 0.0, "mae": 0.0}

    bins = [0, 20000, 50000, 100000, 200000, 500000, 1e9]
    labels = ["<20k", "20-50k", "50-100k", "100-200k", "200-500k", "500k+"]
    habits["income_bracket"] = pd.cut(habits["Income"], bins=bins, labels=labels, include_lowest=True)
    train_df, test_df = random_split(habits, test_frac=0.2, seed=42)
    rates = {}
    for bracket, group in train_df.groupby("income_bracket", observed=True):
        if group.empty:
            continue
        rates[str(bracket)] = float(group["Desired_Savings_Percentage"].mean()) / 100.0
    predictions = []
    actuals = []
    for _, row in test_df.iterrows():
        bracket = str(row["income_bracket"])
        pred = rates.get(bracket, 0.0)
        actual = float(row["Desired_Savings_Percentage"]) / 100.0
        predictions.append(pred)
        actuals.append(actual)
    mse = np.mean([(p - a) ** 2 for p, a in zip(predictions, actuals)]) if predictions else 0.0
    mae = np.mean([abs(p - a) for p, a in zip(predictions, actuals)]) if predictions else 0.0
    return {
        "samples": len(test_df),
        "brier": round(float(mse), 4),
        "mae": round(float(mae), 4),
    }


def evaluate_anomaly_detector(df: pd.DataFrame) -> Dict:
    train_df, test_df = time_split(df, "date", test_frac=0.2)
    if test_df.empty or train_df.empty:
        return {"samples": 0, "precision": 0.0, "recall": 0.0, "alert_rate": 0.0}
    stats = {}
    for category, group in train_df.groupby("category"):
        amounts = group["amount"].abs().dropna().values
        if len(amounts) < 5:
            continue
        median = float(np.median(amounts))
        mad = float(np.median(np.abs(amounts - median)))
        p90 = float(np.percentile(amounts, 90))
        p95 = float(np.percentile(amounts, 95))
        p97 = float(np.percentile(amounts, 97))
        p98 = float(np.percentile(amounts, 98))
        p99 = float(np.percentile(amounts, 99))
        p995 = float(np.percentile(amounts, 99.5))
        stats[category] = {
            "median": median,
            "mad": mad,
            "p90": p90,
            "p95": p95,
            "p97": p97,
            "p98": p98,
            "p99": p99,
            "p995": p995,
        }

    labels = []
    predictions = []
    for category, group in test_df.groupby("category"):
        amounts = group["amount"].abs().dropna().values
        if len(amounts) == 0:
            continue
        threshold = np.percentile(amounts, 95)
        for amount in amounts:
            label = amount > threshold
            labels.append(label)
            threshold_pred = np.percentile(amounts, 90)
            predictions.append(amount > threshold_pred)

    if not labels:
        return {"samples": 0, "precision": 0.0, "recall": 0.0, "alert_rate": 0.0}
    tp = sum(1 for l, p in zip(labels, predictions) if l and p)
    fp = sum(1 for l, p in zip(labels, predictions) if not l and p)
    fn = sum(1 for l, p in zip(labels, predictions) if l and not p)
    precision = safe_div(tp, tp + fp)
    recall = safe_div(tp, tp + fn)
    alert_rate = safe_div(sum(1 for p in predictions if p), len(predictions))
    return {
        "samples": len(labels),
        "precision": round(precision, 4),
        "recall": round(recall, 4),
        "alert_rate": round(alert_rate, 4),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Train UniGuard AI models.")
    parser.add_argument(
        "--model",
        default="all",
        choices=[
            "all",
            "transaction_categorizer",
            "spending_forecaster",
            "budget_allocator",
            "goal_predictor",
            "anomaly_detector",
        ],
        help="Model to train.",
    )
    parser.add_argument(
        "--export-clean",
        action="store_true",
        help="Export cleaned datasets for the selected model.",
    )
    args = parser.parse_args()

    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)

    if args.export_clean:
        export_dir = ROOT / "backend" / "training" / "models" / args.model / "cleaned"
        export_clean_datasets(args.model, export_dir)
        print("Cleaned data written to:", export_dir)
        return

    run_training(args.model)


if __name__ == "__main__":
    main()
