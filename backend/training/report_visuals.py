"""
Generate an HTML training report from training/reports/latest.json.
Run after train_models.py --model all to view metrics and confusion matrix.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REPORTS_DIR = ROOT / "training" / "reports"
REPORT_JSON = REPORTS_DIR / "latest.json"
REPORT_HTML = REPORTS_DIR / "training_report.html"

TARGETS = {
    "transaction_categorizer": {"macro_f1": 0.35, "top3_accuracy": 0.70},
    "spending_forecaster": {"mape": 35.0, "mae": None},
    "budget_allocator": {"rmse": 0.05},
    "goal_predictor": {"brier": 0.02, "mae": 0.05},
    "anomaly_detector": {"precision": 0.25, "alert_rate": 0.10, "recall": 0.45},
}


def _bar_width(value: float, max_val: float = 1.0, invert: bool = False) -> str:
    if max_val and max_val > 0:
        pct = min(100, max(0, (value / max_val) * 100))
    else:
        pct = 0
    if invert:
        pct = 100 - pct
    return f"{pct:.0f}%"


def _metric_ok(name: str, value: float, target: float, lower_is_better: bool) -> bool:
    if target is None:
        return True
    if lower_is_better:
        return value <= target
    return value >= target


def build_html(report: dict) -> str:
    ts = report.get("timestamp", "")
    ds = report.get("datasets", {})
    metrics = report.get("metrics", {})
    sources = report.get("dataset_sources", {})
    filters = report.get("filters", {})

    # Metric cards
    cards = []
    for model, target_spec in TARGETS.items():
        m = metrics.get(model, {})
        rows = []
        for key, target in target_spec.items():
            val = m.get(key)
            if val is None:
                continue
            if key in ("mape", "mae", "rmse", "brier", "alert_rate"):
                ok = _metric_ok(key, val, target, lower_is_better=True)
            else:
                ok = _metric_ok(key, val, target, lower_is_better=False) if target is not None else True
            target_str = f" (target: {target})" if target is not None else ""
            rows.append(f"<tr><td>{key}</td><td>{val}</td><td>{target_str}</td><td>{'✓' if ok else '—'}</td></tr>")
        if not rows:
            rows.append("<tr><td colspan='4'>No metrics</td></tr>")
        cards.append(
            f"""
            <div class="card">
                <h3>{model.replace('_', ' ').title()}</h3>
                <p class="samples">Samples: {m.get('samples', '—')}</p>
                <table class="metrics"><tbody>{''.join(rows)}</tbody></table>
            </div>
            """
        )

    # Confusion matrix (transaction_categorizer)
    cm = metrics.get("transaction_categorizer", {}).get("confusion_matrix", {})
    cm_rows = []
    labels = sorted(cm.keys())
    for true_label in labels:
        preds = cm[true_label]
        cells = []
        for pred_label in labels:
            count = preds.get(pred_label, 0)
            cls = "diag" if true_label == pred_label else "off"
            cells.append(f'<td class="{cls}">{count}</td>')
        cm_rows.append(f"<tr><th>{true_label}</th>{''.join(cells)}</tr>")
    header_cells = "".join(f"<th>{l}</th>" for l in labels)
    confusion_table = ""
    if labels:
        confusion_table = f"""
        <div class="card wide">
            <h3>Transaction Categorizer — Confusion Matrix</h3>
            <div class="table-wrap">
                <table class="confusion">
                    <thead><tr><th>True \\ Pred</th>{header_cells}</tr></thead>
                    <tbody>{''.join(cm_rows)}</tbody>
                </table>
            </div>
        </div>
        """

    # Dataset size bars (visual)
    tx_rows = ds.get("transactions_rows", 0)
    sp_rows = ds.get("spending_rows", 0)
    max_rows = max(tx_rows, sp_rows, 1)
    tx_pct = _bar_width(tx_rows, max_rows)
    sp_pct = _bar_width(sp_rows, max_rows)

    sources_html = []
    for kind, srcs in sources.items():
        sources_html.append(f"<p><strong>{kind}</strong>: {', '.join(srcs)}</p>")

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Training Report — UniGuard</title>
    <style>
        :root {{ --bg: #0f0f12; --card: #18181c; --text: #e4e4e7; --muted: #71717a; --accent: #a78bfa; --ok: #22c55e; }}
        * {{ box-sizing: border-box; }}
        body {{ font-family: system-ui, sans-serif; background: var(--bg); color: var(--text); margin: 0; padding: 1.5rem; line-height: 1.5; }}
        h1 {{ font-size: 1.5rem; margin-bottom: 0.25rem; }}
        .meta {{ color: var(--muted); font-size: 0.875rem; margin-bottom: 1.5rem; }}
        .cards {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }}
        .card {{ background: var(--card); border-radius: 8px; padding: 1rem; border: 1px solid #27272a; }}
        .card.wide {{ grid-column: 1 / -1; }}
        .card h3 {{ margin: 0 0 0.5rem; font-size: 1rem; color: var(--accent); }}
        .samples {{ font-size: 0.8rem; color: var(--muted); margin-bottom: 0.5rem; }}
        table.metrics {{ width: 100%; font-size: 0.85rem; border-collapse: collapse; }}
        table.metrics td, table.metrics th {{ padding: 0.25rem 0.5rem; text-align: left; }}
        table.confusion {{ font-size: 0.75rem; border-collapse: collapse; }}
        table.confusion th, table.confusion td {{ padding: 0.35rem; text-align: center; border: 1px solid #27272a; min-width: 2.5rem; }}
        table.confusion td.diag {{ background: rgba(34, 197, 94, 0.2); }}
        table.confusion td.off {{ color: var(--muted); }}
        .table-wrap {{ overflow-x: auto; }}
        .datasets {{ margin-bottom: 1.5rem; }}
        .bar {{ height: 1.25rem; background: #27272a; border-radius: 4px; overflow: hidden; margin: 0.25rem 0; }}
        .bar-fill {{ height: 100%; background: var(--accent); }}
        .bar-label {{ font-size: 0.8rem; display: flex; justify-content: space-between; margin-bottom: 0.15rem; }}
    </style>
</head>
<body>
    <h1>Training Report</h1>
    <p class="meta">Generated: {ts}</p>

    <section class="datasets">
        <h2 style="font-size: 1.1rem; margin-bottom: 0.5rem;">Dataset sizes</h2>
        <div class="bar-label"><span>Transactions</span><span>{tx_rows} rows</span></div>
        <div class="bar"><div class="bar-fill" style="width: {tx_pct};"></div></div>
        <div class="bar-label"><span>Spending (time series)</span><span>{sp_rows} rows</span></div>
        <div class="bar"><div class="bar-fill" style="width: {sp_pct};"></div></div>
        <h3 style="font-size: 0.95rem; margin-top: 1rem; color: var(--muted);">Sources</h3>
        {''.join(sources_html)}
    </section>

    <h2 style="font-size: 1.1rem; margin-bottom: 0.5rem;">Model metrics</h2>
    <div class="cards">
        {''.join(cards)}
    </div>
    {confusion_table}
</body>
</html>
"""


def main() -> None:
    if not REPORT_JSON.exists():
        print(f"Report not found: {REPORT_JSON}. Run: python training/train_models.py --model all")
        return
    with open(REPORT_JSON) as f:
        report = json.load(f)
    html = build_html(report)
    REPORT_HTML.write_text(html, encoding="utf-8")
    print(f"Visual report written to: {REPORT_HTML}")


if __name__ == "__main__":
    main()
