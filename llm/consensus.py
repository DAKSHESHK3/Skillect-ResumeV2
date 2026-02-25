def consensus(results):

    combined = " ".join(r["analysis"] for r in results)

    impact = combined.lower().count("impact")

    return {
        "results": results,
        "confidence": min(impact/5,1)
    }