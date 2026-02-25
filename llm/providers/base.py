from abc import ABC, abstractmethod

class LLMProvider(ABC):

    @abstractmethod
    async def analyze_resume(self, prompt: str) -> dict:
        pass