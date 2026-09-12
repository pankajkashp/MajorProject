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
    concern_detection_correct = 0
    suggestion_detection_correct = 0

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

        # 3. Extraction Evaluation
        concerns, suggestions = extraction_provider.extract(text, item["id"])
        has_extracted_concern = len(concerns) > 0
        has_extracted_suggestion = len(suggestions) > 0

        if has_extracted_concern == item["has_concern"]:
            concern_detection_correct += 1

        if has_extracted_suggestion == item["has_suggestion"]:
            suggestion_detection_correct += 1

    sentiment_acc = sentiment_correct / total
    topic_acc = topic_correct / total
    concern_acc = concern_detection_correct / total
    suggestion_acc = suggestion_detection_correct / total

    print(f"\n--- PolicyLens Baseline Research Evaluation (N={total}) ---")
    print(f"Sentiment Accuracy: {sentiment_acc * 100:.1f}%")
    print(f"Topic Classification Accuracy: {topic_acc * 100:.1f}%")
    print(f"Concern Detection Accuracy: {concern_acc * 100:.1f}%")
    print(f"Suggestion Detection Accuracy: {suggestion_acc * 100:.1f}%")

    # Baseline acceptance thresholds for local heuristic models
    assert sentiment_acc >= 0.75
    assert topic_acc >= 0.75
    assert concern_acc >= 0.75
    assert suggestion_acc >= 0.75
