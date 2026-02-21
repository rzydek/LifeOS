from abc import ABC, abstractmethod
import os
import requests
import json
import base64
import time
from enum import Enum
from typing import Optional, Dict, Any
from langchain_community.chat_models import ChatOllama
from langchain_openai import ChatOpenAI
from langchain_core.language_models.chat_models import BaseChatModel
from src.config import (
    OLLAMA_HOST, 
    CISCO_CLIENT_ID, 
    CISCO_CLIENT_SECRET, 
    CISCO_APP_KEY, 
    CISCO_CHAT_API_BASE_URL,
    CISCO_OAUTH_URL
)
from src.utils.logger import logger

class ProviderType(Enum):
    OLLAMA = "ollama"
    OPENAI = "openai"
    CISCO = "cisco"

class LLMProvider(ABC):
    @abstractmethod
    def get_llm(self) -> BaseChatModel:
        pass

    @abstractmethod
    def ensure_model(self) -> None:
        pass
    
    def refresh_credentials(self) -> None:
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
                base_url = base_url[:-1] # Remove trailing slash if present
                
            logger.info(f"Checking for Ollama model: {model_name} at {base_url}")
            
            try:
                response = requests.get(f"{base_url}/api/tags", timeout=5)
                if response.status_code == 200:
                    models = response.json().get("models", [])
                    # Check if model currently exists in list
                    if any(model_name in m.get("name", "") for m in models):
                        logger.info(f"Model {model_name} already exists.")
                        return
            except requests.exceptions.RequestException as e:
                 logger.warning(f"Could not connect to Ollama to check tags: {e}")

            logger.info(f"Pulling model {model_name}... This may take a while.")
            
            # Use stream=True to avoid buffering the whole response
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

class CiscoProvider(LLMProvider):
    _access_token: Optional[str] = None
    _token_expiry: float = 0
    
    def __init__(self, model_name: str = "gpt-4o-mini"):
        self.model_name = model_name
        self.client_id = CISCO_CLIENT_ID
        self.client_secret = CISCO_CLIENT_SECRET
        self.app_key = CISCO_APP_KEY
        self.base_url = CISCO_CHAT_API_BASE_URL
        self.oauth_url = CISCO_OAUTH_URL

    def _get_access_token(self, force_refresh: bool = False) -> str:
        if not force_refresh and CiscoProvider._access_token and time.time() < CiscoProvider._token_expiry:
            return CiscoProvider._access_token
            
        if not self.client_id or not self.client_secret:
            raise ValueError("Cisco Client ID and Secret are required")

        auth_str = f"{self.client_id}:{self.client_secret}"
        b64_auth = base64.b64encode(auth_str.encode()).decode()
        
        headers = {
            "Authorization": f"Basic {b64_auth}",
            "Content-Type": "application/x-www-form-urlencoded"
        }
        
        try:
            response = requests.post(
                self.oauth_url,
                headers=headers,
                data={"grant_type": "client_credentials"}
            )
            response.raise_for_status()
            data = response.json()
            
            CiscoProvider._access_token = data["access_token"]
            CiscoProvider._token_expiry = time.time() + data.get("expires_in", 3599) - 300
            return CiscoProvider._access_token
        except Exception as e:
            logger.error(f"Failed to get Cisco access token: {e}")
            raise

    def get_llm(self) -> BaseChatModel:
        token = self._get_access_token()
        
        user_object = {"appkey": self.app_key}

        base = self.base_url.rstrip("/")
        api_base = f"{base}/{self.model_name}"

        return ChatOpenAI(
            model=self.model_name,
            api_key="dummy",
            base_url=api_base,
            default_headers={
                "api-key": token,
                "Content-Type": "application/json"
            },
            model_kwargs={
                "user": json.dumps(user_object),
                "stop": ["<|im_end|>"]
            }
        )

    def ensure_model(self) -> None:
        try:
            self._get_access_token()
        except Exception as e:
            logger.warning(f"Could not verify Cisco provider connection: {e}")

    def refresh_credentials(self) -> None:
        logger.info("Forcing token refresh for Cisco provider")
        self._get_access_token(force_refresh=True)

class LLMProviderFactory:
    @staticmethod
    def get_provider(provider_type: str, model_name: Optional[str] = None) -> LLMProvider:
        if provider_type == ProviderType.OPENAI.value or provider_type == "openai":
            return OpenAIProvider(model_name=model_name or "gpt-4-turbo")
        elif provider_type == ProviderType.CISCO.value or provider_type == "cisco":
            return CiscoProvider(model_name=model_name or "gpt-35-turbo") # specific default for Cisco?
        elif provider_type == ProviderType.OLLAMA.value or provider_type == "ollama":
             return OllamaProvider(model_name=model_name or "llama3")
        else:
            logger.warning(f"Unknown provider type: {provider_type}, defaulting to Ollama")
            return OllamaProvider(model_name=model_name or "llama3")

