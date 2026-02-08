# Backend

This directory contains backend services and infrastructure for UniGuard Wallet.

## Structure

- `training/` - Python ML model training scripts
  - `train_models.py` - Main training script for all AI models
  - `pipeline.py` - Training pipeline
  - `report_visuals.py` - Report generation
  - `data/` - Training data documentation
  - `models/` - Trained model metadata
  - `reports/` - Training reports
- `server/` - Node.js notification server
  - `notify.js` - Email notification service
- `supabase/` - Database migrations
  - `migrations/` - SQL migration files

## Training Models

To train the AI models:

```bash
cd training
python train_models.py --model all
```

Or train a specific model:

```bash
python train_models.py --model transaction_categorizer
```

Trained artifacts are written to `../frontend/src/lib/ai/models/artifacts/`.

## Notification Server

Start the notification server:

```bash
cd server
node notify.js
```

Or from the frontend directory:

```bash
npm run notify:server
```

Requires `.env.local` in the project root with SMTP configuration.

## Database Migrations

Migrations are stored in `supabase/migrations/`. Run them via Supabase CLI or dashboard.
