from app.providers.local_topic import LocalTopicProvider

def test_topic_classification_by_keywords():
    provider = LocalTopicProvider()

    res1 = provider.classify("The mandatory 30-day compliance timeline for MSMEs will crush small startups.")
    assert res1.primary_topic == "Compliance Timelines & MSME Impact"
    assert res1.confidence > 0.6

    res2 = provider.classify("Mandatory algorithmic audits risk leaking trade secrets and proprietary neural weights.")
    assert res2.primary_topic == "Algorithmic Transparency & AI Audits"
    assert "audit" in res2.key_phrases or "algorithmic" in res2.key_phrases

    res3 = provider.classify("Local data storage in domestic data centers requires infrastructure tax credits.")
    assert res3.primary_topic == "Data Localization & Infrastructure"

    res4 = provider.classify("The 4% global turnover penalty is disproportionately punitive without a cure notice.")
    assert res4.primary_topic == "Penalties, Appeals & Safe Harbor"
