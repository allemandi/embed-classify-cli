# 📦 embed-classify-cli

Node.js CLI tool for local text classification using word embeddings.

## 🚀 Features

- 🔄 Convert CSV to JSON embeddings using [`Xenova/all-MiniLM-L6-v2`](https://huggingface.co/Xenova/all-MiniLM-L6-v2)
- 🧠 Classify unlabelled text via pre-trained embeddings
- 📈 Optional evaluation of dataset performance
- 🗃️ Works with CSVs containing `category` and `comment` headers

> Ideal for local NLP classification workflows.

## 📦 Getting Started
```bash
git clone https://github.com/allemandi/embed-classify-cli.git
cd embed-classify-cli
yarn install
yarn start
```

## 🛠️ Usage

### 1. Prepare Your CSVs

Input CSV files must include:

- `category`: Label for training data
- `comment`: Text content to embed or classify

### 2. Generate Embeddings

Generate `embedding.json` from labeled CSV:

```
node index.js csv-embedding -i ./data/training.csv
```

### 3. Classify New Text

Use trained embeddings to classify new input:

```
node index.js embedding-classification -i ./data/unclassified.csv -c ./data/embedding.json -o ./data/predicted.csv
```

> Check configurable flags in `index.js` for more options.


## ⚙️ Configure Classification

Tune classification behavior in `embedding-classification.js` with these params:

- `--weightedVotes`  
  Use averaged similarity scores
- `--comparisonPercentage`  
  % of top similar samples to compare (0–100)
- `--maxSamplesToSearch`  
  Limit how many samples are compared
- `--similarityThresholdPercent`  
  Minimum cosine similarity to include in comparison


## 🔗 Related Projects
Check out these related projects that might interest you:
- **[Embed Classify Web](https://github.com/allemandi/embed-classify-web)**  
  Sleek, modern web app for text classification using embeddings.

- **[@allemandi/embed-utils](https://github.com/allemandi/embed-utils)**  
  Utilities for text classification using cosine similarity embeddings.

- **[Vector Knowledge Base](https://github.com/allemandi/vector-knowledge-base)**  
  A minimalist command-line knowledge system with semantic memory capabilities using vector embeddings for information retrieval.


## 🤝 Contributing
If you have ideas, improvements, or new features:

1. Fork the project
2. Create your feature branch (git checkout -b feature/amazing-feature)
3. Commit your changes (git commit -m 'Add some amazing feature')
4. Push to the branch (git push origin feature/amazing-feature)
5. Open a Pull Request


## ☕ Support
If this project has helped you or saved you time, consider [buying me a coffee](https://www.buymeacoffee.com/allemandi) to help fuel more ideas and improvements!


## 💡 Acknowledgments

This project was developed with the help of AI tools (e.g., GitHub Copilot, Cursor, v0) for code suggestions, debugging, and optimizations.

## 📄 License

MIT
