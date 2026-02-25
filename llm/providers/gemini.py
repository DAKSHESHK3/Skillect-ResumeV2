import google.generativeai as genai
from .base import LLMProvider

class GeminiProvider(LLMProvider):

    def __init__(self, api_key):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel("gemini-pro")

    async def analyze_resume(self, prompt):

        res = self.model.generate_content(prompt)

        return {
            "model": "Gemini",
            "analysis": res.text
        }