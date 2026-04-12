# 📦 embed-classify-cli

Node.js CLI tool for local text classification using word embeddings.

## 🚀 Features

- 🔄 Convert CSV to JSON embeddings using `Xenova/all-MiniLM-L6-v2`
- 🧠 Classify unlabelled text via local vector similarity
- 📈 Model evaluation metrics (Accuracy, Precision, Recall)
- ⚡ Optimized batch processing for high performance
- 🛠️ Customizable similarity thresholds and weighting

## 📦 Getting Started

```bash
git clone https://github.com/allemandi/embed-classify-cli.git
cd embed-classify-cli
yarn install
```

## 🛠️ Usage

### 1. Generate Embeddings

Create `embedding.json` from a labeled CSV (requires `category` and `comment` headers):

```bash
node index.js csv-embedding -i ./data/training.csv -o ./data/embedding.json
```

### 2. Classify New Text

Classify an unlabelled CSV using trained embeddings:

```bash
node index.js embedding-classification -i ./data/unclassified.csv -c ./data/embedding.json -o ./data/predicted.csv
```

#### Advanced Options

- `-r, --resultMetrics`: Include similarity scores and sample counts in output.
- `-e, --evaluateModel`: Run evaluation on a portion of the dataset.
- `--no-weightedVotes`: Use simple majority voting instead of weighted averages.
- `--comparisonPercentage <number>`: % of dataset to use for comparison (default: 80).
- `--maxSamplesToSearch <number>`: Limit samples compared (default: 40).
- `--similarityThresholdPercent <number>`: Minimum cosine similarity % (default: 30).

## ☕ Support

If this project helped you, consider [buying me a coffee](https://www.buymeacoffee.com/allemandi)!

## 📄 License

MIT
