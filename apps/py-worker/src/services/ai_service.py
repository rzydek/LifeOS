import time
import json
import requests
from langchain_community.chat_models import ChatOllama
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field
from src.config import OLLAMA_HOST
from src.utils.logger import logger

class DealEvaluation(BaseModel):
    score: int = Field(description="Score from 0-100 where 100 is an amazing deal and relevant, 0 is spam or irrelevant")
    reasoning: str = Field(description="Short reasoning for the score")

class AIService:
    def __init__(self):
        self.chain = None
        self._initialize()

    def _ensure_ollama_model(self, base_url, model_name="mistral"):
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

    def _initialize(self):
        try:
            self._ensure_ollama_model(OLLAMA_HOST, "mistral")
            llm = ChatOllama(model="mistral", base_url=OLLAMA_HOST)
            
            parser = JsonOutputParser(pydantic_object=DealEvaluation)

            prompt = ChatPromptTemplate.from_messages([
                ("system", "You are an expert car mechanic and parts trader specializing in Mercedes AMG and Jeep. Evaluate if the following item is relevant to the search query and if it's a good deal. Be critical."),
                ("user", "Search Query: {query}\nItem Title: {title}\nItem Description: {description}\nPrice: {price} {currency}\n\nReturn JSON with 'score' (0-100) and 'reasoning'."),
            ])

            self.chain = prompt | llm | parser
        except Exception as e:
            logger.warning(f"Failed to initialize AI: {e}")
            self.chain = None

    def evaluate_offer(self, query, title, description, price, currency):
        if not self.chain:
            return None, None
        try:
            start_time = time.time()
            result = self.chain.invoke({"query": query, "title": title, "description": description, "price": price, "currency": currency})
            logger.info(f"AI Evaluation took {time.time() - start_time:.2f}s: {result}")
            return result.get("score"), result.get("reasoning")
        except Exception as e:
            logger.error(f"AI Evaluation failed: {e}")
            return None, None

ai_service = AIService()
