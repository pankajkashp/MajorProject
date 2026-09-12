import json
import os
from app.providers.local_sentiment import LocalSentimentProvider
from app.providers.local_topic import LocalTopicProvider
from app.providers.local_extraction import LocalExtractionProvider

def test_benchmark_evaluation():
    eval_file = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "../data/samples/labeled_evaluation_dataset.json"
    )
    assert os.path.exists(eval_file), f"Evaluation dataset not found at {eval_file}"

    with open(eval_file, "r", encoding="utf-8") as f:
        samples = json.load(f)

    sentiment_provider = LocalSentimentProvider()
    topic_provider = LocalTopicProvider()
    extraction_provider = LocalExtractionProvider()

    sentiment_correct = 0
    topic_correct = 0
    concern_true_pos = 0
    concern_true_neg = 0
    concern_false_pos = 0
    concern_false_neg = 0

    sugg_true_pos = 0
    sugg_true_neg = 0
    sugg_false_pos = 0
    sugg_false_neg = 0

    total = len(samples)

    for item in samples:
        text = item["text"]

        # 1. Sentiment Evaluation
        sent_res = sentiment_provider.analyze(text)
        if sent_res.label == item["gold_sentiment"]:
            sentiment_correct += 1

        # 2. Topic Evaluation
        topic_res = topic_provider.classify(text)
        if topic_res.primary_topic == item["gold_topic"]:
            topic_correct += 1

        # 3. Concern & Suggestion Extraction Evaluation
        concerns, suggestions = extraction_provider.extract(text, item["id"])
        has_concern = len(concerns) > 0
        has_suggestion = len(suggestions) > 0

        # Concern metrics
        if has_concern and item["has_concern"]:
            concern_true_pos += 1
        elif not has_concern and not item["has_concern"]:
            concern_true_neg += 1
        elif has_concern and not item["has_concern"]:
            concern_false_pos += 1
        elif not has_concern and item["has_concern"]:
            concern_false_neg += 1

        # Suggestion metrics
        if has_suggestion and item["has_suggestion"]:
            sugg_true_pos += 1
        elif not has_suggestion and not item["has_suggestion"]:
            sugg_true_neg += 1
        elif has_suggestion and not item["has_suggestion"]:
            sugg_false_pos += 1
        elif not has_suggestion and item["has_suggestion"]:
            sugg_false_neg += 1

    sentiment_acc = sentiment_correct / total
    topic_acc = topic_correct / total

    concern_acc = (concern_true_pos + concern_true_neg) / total
    concern_prec = concern_true_pos / (concern_true_pos + concern_false_pos) if (concern_true_pos + concern_false_pos) > 0 else 1.0
    concern_rec = concern_true_pos / (concern_true_pos + concern_false_neg) if (concern_true_pos + concern_false_neg) > 0 else 1.0
    concern_f1 = (2 * concern_prec * concern_rec) / (concern_prec + concern_rec) if (concern_prec + concern_rec) > 0 else 0.0

    sugg_acc = (sugg_true_pos + sugg_true_neg) / total
    sugg_prec = sugg_true_pos / (sugg_true_pos + sugg_false_pos) if (sugg_true_pos + sugg_false_pos) > 0 else 1.0
    sugg_rec = sugg_true_pos / (sugg_true_pos + sugg_false_neg) if (sugg_true_pos + sugg_false_neg) > 0 else 1.0
    sugg_f1 = (2 * sugg_prec * sugg_rec) / (sugg_prec + sugg_rec) if (sugg_prec + sugg_rec) > 0 else 0.0

    print("\n=======================================================")
    print(f"PolicyLens Baseline NLP Research Evaluation (N = {total})")
    print("=======================================================")
    print(f"Sentiment Accuracy       : {sentiment_acc * 100:.1f}%")
    print(f"Topic Classification Acc : {topic_acc * 100:.1f}%")
    print(f"Concern Precision / Recall: {concern_prec * 100:.1f}% / {concern_rec * 100:.1f}% (F1: {concern_f1:.2f})")
    print(f"Suggestion Prec / Recall  : {sugg_prec * 100:.1f}% / {sugg_rec * 100:.1f}% (F1: {sugg_f1:.2f})")
    print("=======================================================\n")

    assert sentiment_acc >= 0.80
    assert topic_acc >= 0.80
    assert concern_f1 >= 0.80
    assert sugg_f1 >= 0.80
