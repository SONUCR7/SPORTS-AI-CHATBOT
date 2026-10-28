"""
PyTorch Neural Sports Engine Trainer
Trains a domain neural network directly using the installed PyTorch (torch 2.9.0)
on the 100-Page Sports Compendium dataset.
"""

import os
import json
import torch
import torch.nn as nn
import torch.optim as optim
from collections import Counter

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_PATH = os.path.join(BASE_DIR, "training", "dataset", "sports_train_alpaca.json")
MODEL_SAVE_PATH = os.path.join(BASE_DIR, "models", "sportsai_pytorch_model.pt")

os.makedirs(os.path.dirname(MODEL_SAVE_PATH), exist_ok=True)

# 1. Simple Tokenizer / Vocabulary Builder
class SimpleVocab:
    def __init__(self, max_vocab=4000):
        self.max_vocab = max_vocab
        self.word2idx = {"<PAD>": 0, "<UNK>": 1, "<BOS>": 2, "<EOS>": 3}
        self.idx2word = {0: "<PAD>", 1: "<UNK>", 2: "<BOS>", 3: "<EOS>"}

    def fit(self, texts):
        counter = Counter()
        for t in texts:
            words = t.lower().split()
            counter.update(words)
        for word, _ in counter.most_common(self.max_vocab - 4):
            idx = len(self.word2idx)
            self.word2idx[word] = idx
            self.idx2word[idx] = word

    def encode(self, text, max_len=64):
        words = text.lower().split()[:max_len]
        return [self.word2idx.get(w, 1) for w in words] + [0] * (max_len - len(words))

# 2. Sports Domain Classifier & Embedding Model
class SportsNeuralNet(nn.Module):
    def __init__(self, vocab_size, embed_dim=128, hidden_dim=256, num_classes=4):
        super(SportsNeuralNet, self).__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim, padding_idx=0)
        self.fc1 = nn.Linear(embed_dim, hidden_dim)
        self.relu = nn.ReLU()
        self.dropout = nn.Dropout(0.2)
        self.classifier = nn.Linear(hidden_dim, num_classes) # Cricket, Football, Badminton, OutOfScope

    def forward(self, x):
        embedded = self.embedding(x).mean(dim=1) # Mean pooling over tokens
        hidden = self.relu(self.fc1(embedded))
        hidden = self.dropout(hidden)
        out = self.classifier(hidden)
        return out

def main():
    print("=" * 60)
    print("[TRAINING] Starting PyTorch Sports Neural Engine (torch 2.9.0)")
    print("=" * 60)

    with open(DATASET_PATH, "r", encoding="utf-8") as f:
        samples = json.load(f)

    texts = []
    labels = []
    label_map = {"cricket": 0, "football": 1, "badminton": 2, "out_of_scope": 3}

    for s in samples:
        q = s["instruction"]
        texts.append(q)
        inp = s.get("input", "")
        # Identify sport label precisely from input tag or query
        if "(Cricket)" in inp or "cricket" in q.lower() or "lbw" in q.lower() or "drs" in q.lower() or "kohli" in q.lower():
            labels.append(0)
        elif "(Football)" in inp or "football" in q.lower() or "soccer" in q.lower() or "offside" in q.lower() or "fifa" in q.lower() or "var" in q.lower() or "messi" in q.lower():
            labels.append(1)
        elif "(Badminton)" in inp or "badminton" in q.lower() or "smash" in q.lower() or "bwf" in q.lower() or "shuttle" in q.lower() or "satwik" in q.lower():
            labels.append(2)
        else:
            labels.append(3)

    vocab = SimpleVocab(max_vocab=3000)
    vocab.fit(texts)

    X = torch.tensor([vocab.encode(t, max_len=64) for t in texts], dtype=torch.long)
    y = torch.tensor(labels, dtype=torch.long)

    model = SportsNeuralNet(vocab_size=len(vocab.word2idx), embed_dim=128, hidden_dim=256, num_classes=4)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.005)

    print(f"\n[DATA] Loaded {len(texts)} training samples across Cricket, Football, Badminton.")
    print(f"[VOCAB] Built vocabulary with {len(vocab.word2idx)} unique tokens.")
    print("[TRAIN] Launching 20 training epochs...\n")

    for epoch in range(1, 21):
        model.train()
        optimizer.zero_grad()
        outputs = model(X)
        loss = criterion(outputs, y)
        loss.backward()
        optimizer.step()

        if epoch % 5 == 0 or epoch == 1:
            preds = outputs.argmax(dim=1)
            acc = (preds == y).float().mean() * 100
            print(f"Epoch {epoch:02d}/20 - Loss: {loss.item():.4f} - Accuracy: {acc:.2f}%")

    # Save model and vocabulary
    save_data = {
        "model_state_dict": model.state_dict(),
        "vocab": vocab.word2idx,
        "label_map": label_map
    }
    torch.save(save_data, MODEL_SAVE_PATH)
    print(f"\n[SAVE] Saved trained PyTorch sports model to: {MODEL_SAVE_PATH}")

    # Test sample inference
    test_queries = [
        "Explain Law 36 LBW pitching and DRS in cricket",
        "How does IFAB Law 11 offside and VAR operate?",
        "What is the world record smash speed in badminton by Satwik?",
        "How to bake a chocolate cake at home?"
    ]
    model.eval()
    print("\n[EVAL] Testing Model Inference:")
    reverse_map = {0: "[Cricket]", 1: "[Football]", 2: "[Badminton]", 3: "[Out-of-Scope (Guardrail Refusal)]"}
    with torch.no_grad():
        for q in test_queries:
            t_enc = torch.tensor([vocab.encode(q, max_len=64)], dtype=torch.long)
            logits = model(t_enc)
            pred = logits.argmax(dim=1).item()
            conf = torch.softmax(logits, dim=1)[0, pred].item() * 100
            print(f"  Q: '{q}'\n     -> Predicted: {reverse_map[pred]} ({conf:.1f}% confidence)")

    print("\n[SUCCESS] PyTorch Neural Engine Training Complete!")

if __name__ == "__main__":
    main()
