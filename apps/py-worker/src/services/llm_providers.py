from abc import ABC, abstractmethod
import os
import requests
import json
from enum import Enum
from typing import Optional, Dict
from langchain_community.chat_models import ChatOllama
from langchain_openai import ChatOpenAI
from langchain_core.language_models.chat_models import BaseChatModel
from src.config import OLLAMA_HOST
from src.utils.logger import logger

class ProviderType(Enum):
    OLLAMA = "ollama"
    OPENAI = "openai"

class LLMProvider(ABC):
    @abstractmethod
    def get_llm(self) -> BaseChatModel:
        pass

    @abstractmethod
    def ensure_model(self) -> None:
        pass

class OllamaProvider(LLMProvider):
    def __init__(self, model_name: str = "llama3", base_url: str = OLLAMA_HOST):
        self.model_name = model_name
        self.base_url = base_url

    def get_llm(self) -> BaseChatModel:
        return ChatOllama(model=self.model_name, base_url=self.base_url)

    def ensure_model(self) -> None:
        model_name = self.model_name
        base_url = self.base_url
        try:
            if base_url.endswith('/'):
                base_url = base_url[:-1]
                
            logger.info(f"Checking for Ollama model: {model_name} at {base_url}")
            
            try:
                response = requests.get(f"{base_url}/api/tags", timeout=5)
                if response.status_code == 200:
                    models = response.json().get("models", [])
                    if any(model_name in m.get("name", "") for m in models):
                        logger.info(f"Model {model_name} already exists.")
                        return
            except requests.exceptions.RequestException as e:
                 logger.warning(f"Could not connect to Ollama to check tags: {e}")

            logger.info(f"Pulling model {model_name}... This may take a while.")
            
            response = requests.post(f"{base_url}/api/pull", json={"name": model_name}, stream=True)
            response.raise_for_status()
                
            for line in response.iter_lines():
                if line:
                    try:
                        data = json.loads(line)
                        if data.get("status") == "success":
                            logger.info(f"Model {model_name} pulled successfully.")
                    except:
                        pass
                            
        except Exception as e:
            logger.error(f"Error ensuring Ollama model: {e}")

class OpenAIProvider(LLMProvider):
    def __init__(self, model_name: str = "gpt-4-turbo", api_key: Optional[str] = None):
        self.model_name = model_name
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")

    def get_llm(self) -> BaseChatModel:
        if not self.api_key:
            raise ValueError("OpenAI API Key is required for OpenAIProvider")
        return ChatOpenAI(model=self.model_name, api_key=self.api_key)

    def ensure_model(self) -> None:
        if not self.api_key:
             logger.warning("OpenAI API Key is missing.")

class LLMProviderFactory:
    @staticmethod
    def get_provider(provider_type: str, model_name: Optional[str] = None) -> LLMProvider:
        if provider_type == ProviderType.OPENAI.value or provider_type == "openai":
            return OpenAIProvider(model_name=model_name or "gpt-4-turbo")
        elif provider_type == ProviderType.OLLAMA.value or provider_type == "ollama":
             return OllamaProvider(model_name=model_name or "llama3")
        else:
            logger.warning(f"Unknown provider type: {provider_type}, defaulting to Ollama")
            return OllamaProvider(model_name=model_name or "llama3")

