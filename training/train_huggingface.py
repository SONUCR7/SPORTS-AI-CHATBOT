"""
Hugging Face LLM Training Script for SportsAI
Fine-tunes open-source LLMs (Qwen, Llama 3.2, TinyLlama, Gemma 2, Phi-3)
on the 100-Page Sports Compendium (Cricket, Football, Badminton).

Usage:
    python train_huggingface.py --model_name Qwen/Qwen2.5-0.5B-Instruct --epochs 3
    python train_huggingface.py --model_name TinyLlama/TinyLlama-1.1B-Chat-v1.0 --epochs 3
"""

import os
import sys
import json
import argparse
import torch

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_DIR = os.path.join(BASE_DIR, "training", "dataset")
DEFAULT_OUTPUT_DIR = os.path.join(BASE_DIR, "models", "sportsai-huggingface-llm")

def parse_args():
    parser = argparse.ArgumentParser(description="Fine-tune an LLM on Sports Compendium using Hugging Face")
    parser.add_argument("--model_name", type=str, default="Qwen/Qwen2.5-0.5B-Instruct",
                        help="Hugging Face base model name or path")
    parser.add_argument("--train_file", type=str, default=os.path.join(DATASET_DIR, "sports_train_chat.jsonl"),
                        help="Path to training jsonl")
    parser.add_argument("--val_file", type=str, default=os.path.join(DATASET_DIR, "sports_val_chat.jsonl"),
                        help="Path to validation jsonl")
    parser.add_argument("--output_dir", type=str, default=DEFAULT_OUTPUT_DIR,
                        help="Directory to save fine-tuned model and adapter")
    parser.add_argument("--epochs", type=int, default=3, help="Number of training epochs")
    parser.add_argument("--batch_size", type=int, default=2, help="Per device batch size")
    parser.add_argument("--grad_accum", type=int, default=4, help="Gradient accumulation steps")
    parser.add_argument("--learning_rate", type=float, default=2e-4, help="Learning rate for AdamW")
    parser.add_argument("--max_seq_length", type=int, default=512, help="Max token sequence length")
    parser.add_argument("--use_lora", action="store_true", default=True, help="Use LoRA fine-tuning")
    parser.add_argument("--push_to_hub", action="store_true", default=False, help="Push weights to Hugging Face Hub")
    parser.add_argument("--hub_repo_id", type=str, default="SportsAI-TriSport-LLM", help="HF Hub repository name")
    return parser.parse_args()

def load_jsonl(filepath):
    data = []
    with open(filepath, "r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                data.append(json.loads(line))
    return data

def main():
    args = parse_args()

    print("\n========================================================")
    print("🏆 SportsAI Hugging Face LLM Training Pipeline")
    print(f"📦 Base Model: {args.model_name}")
    print(f"📖 Dataset: {args.train_file}")
    print(f"🎯 Output Directory: {args.output_dir}")
    print(f"⚡ Device: {'CUDA GPU' if torch.cuda.is_available() else 'CPU'}")
    print("========================================================\n")

    try:
        from transformers import (
            AutoModelForCausalLM,
            AutoTokenizer,
            TrainingArguments,
            Trainer,
            DataCollatorForSeq2Seq
        )
    except ImportError:
        print("[ERROR] Hugging Face transformers not installed.")
        print("Please run: pip install transformers datasets accelerate peft")
        sys.exit(1)

    # 1. Load Tokenizer
    print("[1/5] Loading Hugging Face Tokenizer...")
    tokenizer = AutoTokenizer.from_pretrained(args.model_name, trust_remote_code=True)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    # 2. Load Base Model
    print(f"[2/5] Loading Base Model '{args.model_name}'...")
    torch_dtype = torch.bfloat16 if torch.cuda.is_available() and torch.cuda.is_bf16_supported() else (
        torch.float16 if torch.cuda.is_available() else torch.float32
    )

    model = AutoModelForCausalLM.from_pretrained(
        args.model_name,
        torch_dtype=torch_dtype,
        trust_remote_code=True,
        device_map="auto" if torch.cuda.is_available() else None
    )

    # 3. Apply LoRA (Parameter-Efficient Fine-Tuning)
    if args.use_lora:
        try:
            from peft import LoraConfig, get_peft_model, TaskType
            print("[3/5] Initializing LoRA configuration (r=16, alpha=32)...")
            peft_config = LoraConfig(
                task_type=TaskType.CAUSAL_LM,
                r=16,
                lora_alpha=32,
                lora_dropout=0.05,
                bias="none",
                target_modules=["q_proj", "v_proj", "k_proj", "o_proj"]
            )
            model = get_peft_model(model, peft_config)
            model.print_trainable_parameters()
        except ImportError:
            print("[3/5] Warning: PEFT not installed. Proceeding with standard fine-tuning...")
    else:
        print("[3/5] Running Full Fine-Tuning...")

    # 4. Tokenize Dataset
    print("[4/5] Tokenizing 100-Page Sports Compendium Dataset...")
    train_raw = load_jsonl(args.train_file)
    val_raw = load_jsonl(args.val_file)

    def preprocess_conversations(examples):
        formatted_texts = []
        for item in examples:
            msgs = item.get("messages", [])
            if hasattr(tokenizer, "apply_chat_template"):
                try:
                    text = tokenizer.apply_chat_template(msgs, tokenize=False, add_generation_prompt=False)
                except Exception:
                    # Fallback chat format
                    text = "\n".join([f"<|im_start|>{m['role']}\n{m['content']}<|im_end|>" for m in msgs])
            else:
                text = "\n".join([f"### {m['role'].upper()}:\n{m['content']}" for m in msgs])
            formatted_texts.append(text)

        tokens = tokenizer(
            formatted_texts,
            truncation=True,
            max_length=args.max_seq_length,
            padding="max_length"
        )
        tokens["labels"] = tokens["input_ids"].copy()
        return tokens

    class SportsDataset(torch.utils.data.Dataset):
        def __init__(self, encodings):
            self.encodings = encodings

        def __len__(self):
            return len(self.encodings["input_ids"])

        def __getitem__(self, idx):
            return {key: torch.tensor(val[idx]) for key, val in self.encodings.items()}

    train_tokens = preprocess_conversations(train_raw)
    val_tokens = preprocess_conversations(val_raw)

    train_dataset = SportsDataset(train_tokens)
    val_dataset = SportsDataset(val_tokens)

    # 5. Training Arguments & Trainer
    print(f"[5/5] Launching Hugging Face Trainer for {args.epochs} epochs...")
    os.makedirs(args.output_dir, exist_ok=True)

    training_args = TrainingArguments(
        output_dir=args.output_dir,
        num_train_epochs=args.epochs,
        per_device_train_batch_size=args.batch_size,
        gradient_accumulation_steps=args.grad_accum,
        learning_rate=args.learning_rate,
        weight_decay=0.01,
        warmup_ratio=0.06,
        logging_steps=10,
        eval_strategy="epoch",
        save_strategy="epoch",
        save_total_limit=2,
        report_to="none",
        fp16=torch.cuda.is_available(),
        use_cpu=not torch.cuda.is_available()
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=val_dataset,
        tokenizer=tokenizer,
        data_collator=DataCollatorForSeq2Seq(tokenizer, pad_to_multiple_of=8, return_tensors="pt")
    )

    # Train
    train_result = trainer.train()
    print("\n🎉 Training Complete!")
    print(f"📊 Training Loss: {train_result.training_loss:.4f}")

    # Save
    print(f"\n💾 Saving Fine-Tuned Model & Tokenizer to: {args.output_dir}")
    model.save_pretrained(args.output_dir)
    tokenizer.save_pretrained(args.output_dir)

    # Optional Push to Hugging Face Hub
    if args.push_to_hub:
        print(f"🚀 Pushing model to Hugging Face Hub: {args.hub_repo_id}...")
        try:
            model.push_to_hub(args.hub_repo_id)
            tokenizer.push_to_hub(args.hub_repo_id)
            print("✅ Successfully pushed to Hugging Face Hub!")
        except Exception as e:
            print(f"⚠️ Hub push error (Ensure `huggingface-cli login` was run): {e}")

    print("\n✅ SportsAI Hugging Face Model Ready for Inference!")

if __name__ == "__main__":
    main()
