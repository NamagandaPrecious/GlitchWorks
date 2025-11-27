#!/bin/bash
# Quick setup script for Kaggle API token
# Usage: source setup_env.sh

# Set your Kaggle API token
export KAGGLE_API_TOKEN=KGAT_ea83b01d71239c79cacd3bd836319e0f

# Verify it's set
echo "✅ KAGGLE_API_TOKEN is set"
echo "Token (first 10 chars): ${KAGGLE_API_TOKEN:0:10}..."

# Test the connection (requires venv to be activated)
if command -v kaggle &> /dev/null; then
    echo "Testing Kaggle API connection..."
    kaggle competitions list --max-items 3 2>/dev/null && echo "✅ Kaggle API connection successful!" || echo "⚠️  Could not connect (may need to activate venv)"
else
    echo "⚠️  kaggle command not found. Activate venv first: source venv/bin/activate"
fi

# To make it persistent, add to your ~/.bashrc or ~/.bash_profile:
# echo 'export KAGGLE_API_TOKEN=KGAT_ea83b01d71239c79cacd3bd836319e0f' >> ~/.bashrc

