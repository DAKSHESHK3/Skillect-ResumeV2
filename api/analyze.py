import json
from llm.router import run_all_models
from llm.consensus import consensus

async def handler(request):

    body = await request.json()

    prompt = body.get("resume")

    results = await run_all_models(prompt)

    final = consensus(results)

    return {
        "statusCode":200,
        "body":json.dumps(final)
    }