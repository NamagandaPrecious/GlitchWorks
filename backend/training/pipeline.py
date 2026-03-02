import argparse
import json
from pathlib import Path
from typing import Dict, List

from training import train_models

ROOT = Path(__file__).resolve().parents[1]
MODELS_DIR = ROOT / "training" / "models"
DATA_DIR = ROOT / "training" / "data"
MANIFEST_PATH = DATA_DIR / "datasets_manifest.json"


def load_model_datasets(model: str) -> List[str]:
    config_path = MODELS_DIR / model / "datasets.json"
    if not config_path.exists():
        return []
    payload = json.loads(config_path.read_text())
    return list(payload.get("kaggle_datasets", []))


def load_all_datasets() -> List[str]:
    datasets: List[str] = []
    for model_dir in MODELS_DIR.iterdir():
        if not model_dir.is_dir():
            continue
        datasets.extend(load_model_datasets(model_dir.name))
    return sorted(set(datasets))


def download_datasets(datasets: List[str]) -> Dict[str, str]:
    try:
        import kagglehub  # type: ignore
    except Exception as exc:  # pragma: no cover - import guard
        raise SystemExit(
            "Missing kagglehub. Install it with: "
            "python3 -m pip install kagglehub"
        ) from exc

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    manifest: Dict[str, str] = {}
    for dataset in datasets:
        path = kagglehub.dataset_download(dataset)
        manifest[dataset] = str(path)
        print(f"Downloaded {dataset} -> {path}")
    MANIFEST_PATH.write_text(json.dumps(manifest, indent=2))
    return manifest


def export_clean(model: str) -> None:
    export_dir = MODELS_DIR / model / "cleaned"
    train_models.DATASET_PATHS = train_models.resolve_dataset_paths()
    train_models.export_clean_datasets(model, export_dir)
    print("Cleaned data written to:", export_dir)

def main() -> None:
    parser = argparse.ArgumentParser(description="Per-model training pipeline.")
    parser.add_argument("step", choices=["download", "clean", "train"])
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
    )
    args = parser.parse_args()

    if args.step == "download":
        datasets = load_all_datasets() if args.model == "all" else load_model_datasets(args.model)
        if not datasets:
            raise SystemExit(f"No datasets configured for model '{args.model}'.")
        download_datasets(datasets)
        return

    if args.model == "all":
        models = [
            "transaction_categorizer",
            "spending_forecaster",
            "budget_allocator",
            "goal_predictor",
            "anomaly_detector",
        ]
    else:
        models = [args.model]

    if args.step == "clean":
        for model in models:
            export_clean(model)
        return

    if args.step == "train":
        for model in models:
            train_models.DATASET_PATHS = train_models.resolve_dataset_paths()
            train_models.run_training(model)
        return


if __name__ == "__main__":
    main()
