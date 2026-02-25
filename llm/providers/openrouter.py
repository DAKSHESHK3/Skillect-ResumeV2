import httpx
from .base import LLMProvider

class OpenRouterProvider(LLMProvider):

    def __init__(self, api_key, model):
        self.api_key = api_key
        self.model = model

    async def analyze_resume(self, prompt):

        async with httpx.AsyncClient() as client:

            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}"
                },
                json={
                    "model": self.model,
                    "messages":[
                        {"role":"user","content":prompt}
                    ]
                }
            )

        return {
            "model": self.model,
            "analysis": response.json()["choices"][0]["message"]["content"]
        }