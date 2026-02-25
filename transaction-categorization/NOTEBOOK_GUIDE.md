# Notebook guide: Random Forest, Logistic Regression, Naive Bayes

This document explains **what each section does**, **what output you see**, and **how it works**.

---

## 1. Load the dataset

**What it does:** Reads the CSV file `transactions_dataset.csv` into a pandas DataFrame. Each row has **Text** (transaction description) and **Category Id** (0–9).

**How:** Uses `Path` to find the file in the project directory so the path works even if the notebook’s current working directory is different.

**Output:** A table (e.g. first 30 rows) showing sample transactions and their category ids. Example: `Lidl ))))` → 2, `Deposit Rent` → 1.

---

## 2. Download NLTK stopwords

**What it does:** Downloads the NLTK “stopwords” list (common words like “the”, “a”, “on”) for English (and later Danish). These are removed during text cleaning so the model focuses on meaningful words.

**How:** `nltk.download('stopwords')` fetches the data to your NLTK data folder (e.g. `~/nltk_data`). Only needed once per environment.

**Output:** A message like “Package stopwords is already up-to-date!” or “Successfully installed stopwords”, and the return value `True`.

---

## 3. Cleaning the texts (build corpus)

**What it does:** Turns each transaction **Text** into a cleaned, normalized string and stores all of them in a list called `corpus`. This is the same kind of text the model will see at training and prediction time.

**How (step by step):**
1. **Remove non-alphanumeric characters** – `re.sub('[^a-zA-Z0-9]', ' ', text)` replaces everything that isn’t a letter or digit with a space (e.g. “Lidl ))))” → “Lidl”).
2. **Lowercase** – so “Netflix” and “netflix” are the same.
3. **Split into words** – e.g. “deposit rent” → `['deposit', 'rent']`.
4. **Remove stopwords** – drops words like “the”, “on”, “i” (English and Danish).
5. **Stem** – PorterStemmer reduces words to a base form (e.g. “spent” → “spent”, “subscription” → “subscript”).
6. **Join back** – one space-separated string per transaction.

**Output:** None (no print). It fills the list `corpus`, which is used in the next cell.

---

## 4. Bag of Words + train/test split

**What it does:**  
- Converts the cleaned text into **numbers** the models can use (Bag of Words).  
- Splits data into **training set** (80%) and **test set** (20%).

**How:**
- **CountVectorizer(max_features=200):** Builds a vocabulary from the corpus and turns each text into a vector of **word counts**. Each of the 200 features is one word; the value is how many times that word appears in the text. So each transaction becomes a vector of 200 numbers.
- **X** = feature matrix (one row per transaction, 200 columns).  
- **y** = labels (Category Id for each row).
- **train_test_split(..., test_size=0.2, random_state=0):** 80% of rows go to `X_train`, `y_train`; 20% to `X_test`, `y_test`. `random_state=0` makes the split reproducible.

**Output:** None. It creates `X_train`, `X_test`, `y_train`, `y_test`, and the fitted `cv` (vectorizer).

---

## 5. Naive Bayes

**What it does:** Trains a **Gaussian Naive Bayes** classifier on the training set, then predicts categories for the test set and reports **accuracy** (fraction of correct predictions).

**How:**  
- Naive Bayes assumes features (word counts) are independent given the category and uses Bayes’ rule to estimate P(category | word counts).  
- `classifier.fit(X_train, y_train)` learns from the training data.  
- `classifier.predict(X_test)` predicts a category for each test row.  
- **Confusion matrix** `cm`: rows = true category, columns = predicted; diagonal = correct.  
- **Accuracy** = correct predictions / total test samples.

**Output:** A single number, e.g. `0.636...` (63.6% accuracy on the test set). The cell also computes `cm` (confusion matrix) but only prints the accuracy.

---

## 6. Logistic Regression

**What it does:** Same idea as above, but with a **Logistic Regression** classifier: train on `X_train`/`y_train`, predict on `X_test`, compute confusion matrix and accuracy.

**How:** Logistic regression learns a linear combination of the 200 word-count features and passes it through a sigmoid (for binary) or softmax (for multi-class) to get class probabilities. The class with highest probability is the prediction.

**Output:** One number: test **accuracy** (e.g. 0.72). Again `cm` is computed but not printed in this cell.

---

## 7. Random Forest

**What it does:** Trains a **Random Forest** classifier (many decision trees, each on a random subset of features/data), predicts on the test set, and reports accuracy.

**How:** Each tree votes for a category; the forest picks the majority vote. `n_estimators=10` means 10 trees; `criterion='entropy'` is used for splitting.

**Output:** One number: test **accuracy**. After this cell, the variable `classifier` refers to this Random Forest model (used later for single-statement prediction).

---

## 8. Performance comparison (all models + confusion matrix plots)

**What it does:** Trains **all three models** again on the same data, then for each model:
- Prints **accuracy** on the test set.
- Prints a **classification report** (precision, recall, F1 per category and macro/weighted).
- Prints the **confusion matrix** as numbers.
- **Draws** the confusion matrix as a **heatmap** (blue = count; numbers in cells).

**How:**  
- Loops over the three classifiers, fits each on `X_train`/`y_train`, predicts on `X_test`.  
- Uses `sklearn.metrics` for report and confusion matrix.  
- `plot_confusion_matrix()` uses matplotlib: rows = true label, columns = predicted; category names on axes.

**Output:** For each model: text block (accuracy + report + matrix) and one **figure** (heatmap). So you get three figures and can compare which model confuses which categories.

---

## 9. Category names (mapping id → name)

**What it does:** Defines a dictionary **categories** that maps category **id** (0–9) to a **readable name** (e.g. 3 → “Recreation and Leisure”). Defines **get_category_by_id(id)** to look up the name.

**Output:** None. You use `categories` and `get_category_by_id` in the next cells.

---

## 10. Prediction demo (list of texts)

**What it does:** Takes a **list of raw transaction texts** (e.g. `['lidl', 'netto ))', 'netflix', 'kfc', 'rent']`), runs them through the **current** `classifier` (and vectorizer `cv`), and shows the predicted category **name** for each.

**How:**  
- `cv.transform(inputs)` turns each string into a 200-dimensional count vector (using the vocabulary learned in the Bag of Words step).  
- `classifier.predict(...)` returns an array of category **ids**.  
- The dict comprehension maps each input to `get_category_by_id(prediction)`.

**Output:** A dictionary, e.g. `{'lidl': 'Groceries', 'netflix': 'Recreation and Leisure', ...}`.  
**Note:** If you pass raw strings here without the same preprocessing as the corpus, the vectorizer still tokenizes them, but for best results use the “Quick date entry” helper below, which preprocesses the same way as training.

---

## 11. Quick date entry (single statement → category)

**What it does:** Lets you type a **free-text statement** (e.g. “i spent 4k on netflix sub”) and get one predicted **category name** (e.g. “Recreation and Leisure”). Intended for your “quick date entry” feature.

**How:**  
- **preprocess_for_model(raw_text):** Applies the **same** cleaning as the corpus (regex, lower, split, remove EN/DA stopwords, stem, join). So the model sees text in the same format as training.  
- **predict_category(statement):** Preprocesses the statement, runs `vectorizer.transform([preprocessed])`, then `classifier.predict(...)`, then maps the id to a name via `categories`.  
- The demo calls `predict_category("i spent 4k on netflix sub")` and prints the result.

**Output:** Two lines, e.g.:  
`Statement: "i spent 4k on netflix sub"`  
`Predicted category: Recreation and Leisure`

---

## Summary flow

1. **Data** → load CSV (Text, Category Id).  
2. **Text** → clean and normalize into `corpus`.  
3. **Features** → Bag of Words from `corpus` → `X`, labels → `y`.  
4. **Split** → 80% train, 20% test.  
5. **Train** → Naive Bayes, Logistic Regression, Random Forest on `X_train`, `y_train`.  
6. **Evaluate** → accuracy, classification report, confusion matrix (text + plot) on `X_test`, `y_test`.  
7. **Use** → map id → name; predict on new texts (list or single statement) using the same `cv` and chosen `classifier`, with matching preprocessing for free-text statements.
