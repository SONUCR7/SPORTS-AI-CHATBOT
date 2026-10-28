"""
Dataset Preparation for Hugging Face LLM Fine-Tuning
Converts the 100-Page Sports Compendium into instruction-tuning datasets
in Hugging Face Conversational and Alpaca formats.
"""

import json
import os
import random

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KB_PATH = os.path.join(BASE_DIR, "knowledge_base", "sports_compendium_100_pages.json")
OUTPUT_DIR = os.path.join(BASE_DIR, "training", "dataset")

os.makedirs(OUTPUT_DIR, exist_ok=True)

SYSTEM_PROMPT = (
    "You are SportsAI, an authoritative, zero-hallucination sports engine specializing strictly "
    "in Cricket, Football, and Badminton. Ground all statistics, rules, and player achievements "
    "in official verified governing bodies (MCC, IFAB, BWF) and the 100-page Sports Compendium."
)

NEGATIVE_EXAMPLES = [
    {
        "query": "How do I bake a chocolate cake at home?",
        "response": (
            "### 🛡️ SportsAI Strict Tri-Sport Oracle Guardrail\n\n"
            "I am **SportsAI**, an intelligence engine strictly calibrated to provide "
            "**zero-hallucination, verified knowledge** for **Cricket, Football, and Badminton**.\n\n"
            "Your query regarding baking falls outside our three core sports domains. "
            "Please ask any question related to Cricket (MCC laws, DRS, IPL), "
            "Football (IFAB offside, VAR, UCL), or Badminton (BWF 1.15m service rule, 565 km/h smash speeds)!"
        )
    },
    {
        "query": "Write a Python script for quicksort algorithm.",
        "response": (
            "### 🛡️ SportsAI Strict Tri-Sport Oracle Guardrail\n\n"
            "I am **SportsAI**, an intelligence engine specialized exclusively in Cricket, Football, and Badminton. "
            "Programming questions fall outside our sports domain. How can I assist with sports tactics, rules, or player records today?"
        )
    },
    {
        "query": "Who was the president of the United States in 1865?",
        "response": (
            "### 🛡️ SportsAI Strict Tri-Sport Oracle Guardrail\n\n"
            "I am **SportsAI**, strictly dedicated to Cricket, Football, and Badminton intelligence. "
            "Political history queries are declined to maintain zero-hallucination sports accuracy."
        )
    },
    {
        "query": "Tell me about NBA basketball rules and LeBron James.",
        "response": (
            "### 🛡️ SportsAI Strict Tri-Sport Oracle Guardrail\n\n"
            "I specialize strictly in **Cricket**, **Football**, and **Badminton**. "
            "Basketball falls outside our primary Tri-Sport Compendium. Ask me about FIFA football, ICC cricket, or BWF badminton!"
        )
    }
]

def generate_samples_for_page(page):
    sport = page["sport"]
    sport_icon = "🏏" if sport == "cricket" else "⚽" if sport == "football" else "🏸"
    page_num = page["page"]
    title = page["title"]
    chapter = page["chapter"]
    content = page["content"]
    stats = page.get("stats", {})

    stats_md = ""
    if stats:
        stats_md = "\n\n#### 📊 Verified Benchmark Metrics\n| Metric / Parameter | Official Value |\n| :--- | :--- |\n"
        for k, v in stats.items():
            formatted_k = k.replace("_", " ").title()
            formatted_v = ", ".join(v) if isinstance(v, list) else str(v)
            stats_md += f"| **{formatted_k}** | `{formatted_v}` |\n"

    base_response = (
        f"### {sport_icon} {title}\n\n"
        f"**Domain:** {sport.capitalize()} | **Chapter:** {chapter} *(Page {page_num})*\n"
        f"{stats_md}\n"
        f"#### 🔍 Factual Analysis & Rule Mechanics\n{content}\n\n"
        f"#### 🎯 Key Takeaway & Citations\n"
        f"- Grounded strictly in **Page {page_num}** of the 100-Page Sports Compendium.\n"
        f"- Verified against official governing standards (MCC for Cricket, IFAB for Football, BWF for Badminton)."
    )

    # Generate 3 variations of questions per page
    queries = [
        f"Explain {title} in detail according to official sports standards.",
        f"What are the official rules and verified statistics regarding {title}?",
        f"Can you provide a deep breakdown of {chapter}: {title}?"
    ]

    samples = []
    for q in queries:
        samples.append({
            "instruction": q,
            "input": f"[Context: 100-Page Sports Compendium, Page {page_num} ({sport.capitalize()})]",
            "output": base_response,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": q},
                {"role": "assistant", "content": base_response}
            ]
        })
    return samples

def main():
    with open(KB_PATH, "r", encoding="utf-8") as f:
        pages = json.load(f)

    all_samples = []
    for page in pages:
        all_samples.extend(generate_samples_for_page(page))

    # Add negative guardrail examples
    for neg in NEGATIVE_EXAMPLES:
        all_samples.append({
            "instruction": neg["query"],
            "input": "",
            "output": neg["response"],
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": neg["query"]},
                {"role": "assistant", "content": neg["response"]}
            ]
        })

    random.seed(42)
    random.shuffle(all_samples)

    split_idx = int(len(all_samples) * 0.9)
    train_data = all_samples[:split_idx]
    val_data = all_samples[split_idx:]

    # Write JSONL in Hugging Face chat messages format
    train_chat_path = os.path.join(OUTPUT_DIR, "sports_train_chat.jsonl")
    with open(train_chat_path, "w", encoding="utf-8") as f:
        for item in train_data:
            f.write(json.dumps({"messages": item["messages"]}, ensure_ascii=False) + "\n")

    val_chat_path = os.path.join(OUTPUT_DIR, "sports_val_chat.jsonl")
    with open(val_chat_path, "w", encoding="utf-8") as f:
        for item in val_data:
            f.write(json.dumps({"messages": item["messages"]}, ensure_ascii=False) + "\n")

    # Write Alpaca format
    train_alpaca_path = os.path.join(OUTPUT_DIR, "sports_train_alpaca.json")
    with open(train_alpaca_path, "w", encoding="utf-8") as f:
        json.dump(train_data, f, indent=2, ensure_ascii=False)

    print(f"[SUCCESS] Generated {len(all_samples)} total training samples from 100 pages.")
    print(f"[DATASET] Train set: {len(train_data)} samples -> {train_chat_path}")
    print(f"[DATASET] Validation set: {len(val_data)} samples -> {val_chat_path}")

if __name__ == "__main__":
    main()
