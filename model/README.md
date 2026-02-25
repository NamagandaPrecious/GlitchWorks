# Kaggle Dataset Downloader

This project provides scripts to download and load the Personal Budget Transactions dataset from Kaggle.

## Prerequisites

1. **Python 3.8+**: Python 3.8 or higher is required
2. **Kaggle Account**: You need a Kaggle account to download datasets
3. **Kaggle API Authentication**: Use one of these methods:
   - **Environment Variable (CLI)**: Set `KAGGLE_API_TOKEN` environment variable (works with CLI, Python API will use CLI as fallback)
   - **Environment Variables (Python API)**: Set `KAGGLE_USERNAME` and `KAGGLE_KEY` environment variables
   - **kaggle.json file**: Download from [Kaggle Account Settings](https://www.kaggle.com/account)

## Setup Instructions

### Option 1: Using Python Script (Local Environment)

1. **Install required packages**:
   ```bash
   pip install kaggle pandas
   ```

2. **Authenticate with Kaggle** (choose one method):

   **Method A: Environment Variable (Recommended)**
   ```bash
   export KAGGLE_API_TOKEN=your_token_here
   python download_kaggle_dataset.py
   ```

   **Method B: kaggle.json file**
   - Download `kaggle.json` from https://www.kaggle.com/account
   - Place it in the same directory as `download_kaggle_dataset.py`
   - Run: `python download_kaggle_dataset.py`

3. **Run the script**:
   ```bash
   python download_kaggle_dataset.py
   ```

The script will:
- Install kaggle package if needed
- Detect and use your Kaggle credentials (environment variable or kaggle.json)
- Download the dataset
- Extract and load it into a pandas DataFrame

### Option 2: Using Jupyter Notebook

1. **Set up virtual environment** (recommended):
   ```bash
   # Create virtual environment
   python3 -m venv venv
   
   # Activate virtual environment
   source venv/bin/activate  # On Linux/Mac
   # or
   venv\Scripts\activate  # On Windows
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Register kernel for Jupyter
   python -m ipykernel install --user --name=model_1 --display-name="Python 3.12.3 (model_1)"
   ```

2. **Open the notebook**:
   ```bash
   jupyter notebook download_kaggle_dataset.ipynb
   ```
   - When prompted, select the kernel "Python 3.12.3 (model_1)" or your virtual environment

3. **Authenticate with Kaggle** (choose one method):
   - **Method A**: Set environment variable in a cell:
     ```python
     import os
     os.environ['KAGGLE_API_TOKEN'] = 'your_token_here'
     ```
   - **Method B**: Upload `kaggle.json`:
     - In Google Colab: Use the file upload widget in the notebook
     - In Jupyter: Place `kaggle.json` in the same directory as the notebook

4. **Run all cells** sequentially

### Option 3: Google Colab

1. Upload `download_kaggle_dataset.ipynb` to Google Colab
2. Upload your `kaggle.json` file using the file upload widget
3. Run all cells

## Manual Setup (Alternative)

If you prefer to set up manually:

**Using Environment Variable:**
```bash
# Install kaggle
pip install kaggle

# Set environment variable
export KAGGLE_API_TOKEN=your_token_here

# Download dataset
kaggle datasets download -d ismetsemedov/personal-budget-transactions-dataset

# Extract
unzip personal-budget-transactions-dataset.zip

# Load in Python
python -c "import pandas as pd; df = pd.read_csv('personal_budget_transactions.csv'); print(df.head()); print(df.shape)"
```

**Using kaggle.json file:**
```bash
# Install kaggle
pip install kaggle

# Create .config/kaggle directory (newer API location - preferred)
mkdir -p ~/.config/kaggle

# Also create .kaggle directory for backward compatibility
mkdir -p ~/.kaggle

# Copy kaggle.json to both locations
cp kaggle.json ~/.config/kaggle/
cp kaggle.json ~/.kaggle/

# Set permissions
chmod 600 ~/.config/kaggle/kaggle.json
chmod 600 ~/.kaggle/kaggle.json

# Download dataset
kaggle datasets download -d ismetsemedov/personal-budget-transactions-dataset

# Extract
unzip personal-budget-transactions-dataset.zip

# Load in Python
python -c "import pandas as pd; df = pd.read_csv('personal_budget_transactions.csv'); print(df.head()); print(df.shape)"
```

## Files

- `download_kaggle_dataset.py` - Standalone Python script
- `download_kaggle_dataset.ipynb` - Jupyter notebook version
- `README.md` - This file

## Dataset Information

- **Dataset**: Personal Budget Transactions Dataset
- **Author**: ismetsemedov
- **Expected size**: ~10,000+ rows
- **File**: `personal_budget_transactions.csv`

## Troubleshooting

### ipykernel Not Found Error
If you see "Running cells with 'Python 3.x' requires the ipykernel package":
```bash
# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Linux/Mac

# Install ipykernel
pip install ipykernel

# Register kernel
python -m ipykernel install --user --name=model_1 --display-name="Python 3.12.3 (model_1)"
```
Then select the kernel in your Jupyter notebook.

### Permission Denied Error
If you get a permission error, make sure `kaggle.json` has the correct permissions:
```bash
chmod 600 ~/.config/kaggle/kaggle.json
# Or for older location:
chmod 600 ~/.kaggle/kaggle.json
```

### Credentials Location Error
If you see "Could not find kaggle.json. Make sure it's located in ~/.config/kaggle":
- The newer Kaggle API looks for credentials in `~/.config/kaggle/` (not `~/.kaggle/`)
- Make sure your `kaggle.json` is in the correct location:
  ```bash
  mkdir -p ~/.config/kaggle
  cp kaggle.json ~/.config/kaggle/
  chmod 600 ~/.config/kaggle/kaggle.json
  ```

### File Not Found Error
- Ensure `kaggle.json` is in the correct location
- Check that the file name is exactly `kaggle.json` (case-sensitive)

### Dataset Download Fails
- Verify your Kaggle API credentials are correct
- Check your internet connection
- Ensure the dataset name is correct: `ismetsemedov/personal-budget-transactions-dataset`

## Security Note

⚠️ **Important**: Never commit `kaggle.json` to version control! Add it to `.gitignore`:
```
kaggle.json
*.json
~/.kaggle/
```

