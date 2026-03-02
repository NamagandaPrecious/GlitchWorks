# Using Gradient-Based ML Models — Design Guide

This document describes **how to prefer and adopt gradient-based models** (e.g. neural networks with PyTorch or TensorFlow) for UniGuard Wallet, while keeping the rest of the pipeline (data, notebooks, evaluation) the same.

---

## 1. Which Models to Replace First

| Model | Suited for gradient-based? | Suggested approach |
|-------|-----------------------------|---------------------|
| **Transaction categorizer** | **Yes (best fit)** | Text + amount → category. Use an embedding + MLP, or a small transformer/CNN; train with cross-entropy. |
| **Spending forecaster** | Yes | Time series per category. Use LSTM, Transformer, or a small temporal model; train with MSE/MAE. |
| **Anomaly detector** | Yes | Learn normal distribution or use autoencoder; flag reconstruction error or density. |
| **Budget allocator** | Optional | Tabular regression. A small MLP or gradient-boosted trees (XGBoost/LightGBM) both work. |
| **Goal predictor** | Optional | Tabular: income (+ optional features) → savings rate. MLP or gradient boosting. |

**Recommendation:** Start with the **transaction categorizer** (classification on text + amount). It has clear inputs/outputs and you already have labeled data and evaluation (F1, top-3 accuracy).

---

## 2. Two Ways to Use Gradient-Based Models

### Option A: Train in Python, run in the browser (no server)

- **Train:** PyTorch or TensorFlow in Python (e.g. in your existing notebooks or `backend/training/`).
- **Export:** Serialize weights and a small inference recipe, or use **ONNX** and run with **ONNX Runtime Web** (or similar) in the browser.
- **Frontend:** Replace the current rule-based categorizer (and similar) with a call to the exported model. Data never leaves the device; same privacy as today.
- **Pros:** No backend for inference; works offline.  
- **Cons:** Model size and complexity limited by browser; you must export and possibly simplify the model.

### Option B: Train in Python, run on a server (API)

- **Train:** Same as above in Python.
- **Serve:** Small API (e.g. FastAPI) that loads the trained model (PyTorch/TF or ONNX) and exposes endpoints like `POST /predict/category` (body: `{ "description", "amount", "merchant" }`).
- **Frontend:** Call this API instead of the in-browser TS artifact. Optionally keep the rule-based path as fallback when offline or when the API is unavailable.
- **Pros:** No limit on model size; easy to update the model without redeploying the frontend.  
- **Cons:** Requires a backend and network; latency and availability.

**Practical preference:** Use **Option A** for the categorizer (and similar) if you want to keep everything client-side and simple. Use **Option B** if you want larger or more complex models and are fine running an inference service.

---

## 3. What Stays the Same

- **Data:** Same datasets, same `build_*_dataset()` and cleaning in `train_models.py`. You still use your existing notebooks to load data and run “before/after” stats.
- **Evaluation:** Same metrics (macro F1, top-3 accuracy for categorizer; MAE/MAPE for forecaster; etc.). Train in Python, then evaluate on the same holdout splits.
- **Notebooks:** You can keep one notebook per model; the “training” cell can call a gradient-based training script (e.g. `train_categorizer_torch.py`) instead of (or in addition to) the current rule-based training. Artifacts become: either exported weights/ONNX for the frontend, or you just deploy the same saved model on the server.

---

## 4. Concrete Steps for the Transaction Categorizer (Example)

1. **Environment**  
   In `backend/training/` (or a dedicated env):
   ```bash
   pip install torch pandas numpy  # and tokenization: e.g. transformers if you use BERT, or just torch + your tokenizer
   ```

2. **Data**  
   Reuse `build_transaction_dataset()` from `train_models.py`. Encode:
   - **Text:** Vocabulary from training descriptions + tokenize (e.g. word IDs or subwords); optional: pretrained embeddings.
   - **Amount:** Normalize (e.g. log1p(amount) or bucket).
   - **Label:** Category index (same `ALLOWED_CATEGORIES` or the subset you use in evaluation).

3. **Model (PyTorch-style)**  
   - Embedding for word indices + amount (or a small amount MLP).
   - Concatenate → one or two linear layers → logits for num_classes.
   - Loss: `CrossEntropyLoss`; optimizer: Adam; train for several epochs on the same train split you use for evaluation.

4. **Export for browser (Option A)**  
   - Export to ONNX: `torch.onnx.export(...)` with a dummy input.
   - In the frontend, use `onnxruntime-web` to load the ONNX file and run inference (description → token IDs, amount → scalar; same encoding as in Python).
   - Replace the current `categorizeTransaction()` implementation so it calls the ONNX model when available, and falls back to the rule-based artifact if not.

5. **Or serve via API (Option B)**  
   - Save the PyTorch state dict or the ONNX file; load it in a FastAPI app and expose e.g. `POST /predict/category`.
   - Frontend sends `{ description, amount }` and gets `{ category, confidence, alternatives }`; use that instead of the in-browser rule-based result when the API is used.

6. **Evaluation**  
   After each training run, compute macro F1 and top-3 accuracy on the same test set (e.g. by calling your evaluation script from the notebook). No change to how you define the metrics; only the model that produces predictions changes.

---

## 5. Summary

- **Prefer gradient-based** where it adds value: start with the **transaction categorizer** (text + amount → category), then consider **spending forecaster** and **anomaly detector**.
- **Choose deployment:** browser (Option A: export ONNX/weights) for simplicity and privacy; server (Option B: inference API) for larger or frequently updated models.
- **Keep:** existing data pipeline, evaluation metrics, and notebook structure; only the “model” part (training + inference) becomes gradient-based and optionally exported or served.

If you tell me whether you want browser-only or server-side inference, the next step can be a minimal PyTorch training script and export/API example for the transaction categorizer wired to your current `build_transaction_dataset()` and evaluation.
