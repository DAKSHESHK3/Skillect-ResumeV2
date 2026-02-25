import asyncio
import os
from llm.providers.gemini import GeminiProvider
from llm.providers.openrouter import OpenRouterProvider

async def run_all_models(prompt):

    models = [

        GeminiProvider(os.getenv("GEMINI_API_KEY")),

        OpenRouterProvider(
            os.getenv("OPENROUTER_API_KEY"),
            "anthropic/claude-3-haiku"
        ),

        OpenRouterProvider(
            os.getenv("OPENROUTER_API_KEY"),
            "mistralai/mixtral-8x7b"
        )
    ]

    tasks = [m.analyze_resume(prompt) for m in models]

    return await asyncio.gather(*tasks)