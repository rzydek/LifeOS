import time
import json
import requests
from typing import List, Optional
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field
from src.config import AI_PROVIDER, AI_MODEL
from src.utils.logger import logger
from src.services.llm_providers import LLMProviderFactory

class DealReasoning(BaseModel):
    en: str = Field(description="Short reasoning in English")
    pl: str = Field(description="Krótkie uzasadnienie po polsku")

class DealEvaluation(BaseModel):
    pros: List[str] = Field(description="List of positive aspects in POLISH language. Each item must be a simple string, NOT an object.")
    cons: List[str] = Field(description="List of negative aspects in POLISH language. Each item must be a simple string, NOT an object.")
    market_analysis: str = Field(description="Brief analysis of price vs market value in POLISH language. Must be a string.")
    score: int = Field(description="Score from 0-100 where 100 is an amazing deal and relevant, 0 is spam or irrelevant")
    summary: DealReasoning = Field(description="Summary reasoning for the score in both languages")

class AIService:
    def __init__(self):
        self.chain = None
        self.default_instruction = (
            "You are an expert evaluator of online listings. Your goal is to determine if an item "
            "matches the user's search intent and if it represents a good value. "
            "The target audience is Polish speakers in Poland. Listings in Polish are native and expected."
        )
        self._initialize()

    def _initialize(self):
        try:
            logger.info(f"Initializing AI Service with Provider: {AI_PROVIDER}, Model: {AI_MODEL}")
            provider = LLMProviderFactory.get_provider(AI_PROVIDER, AI_MODEL)
            provider.ensure_model()
            
            llm = provider.get_llm()
            
            parser = JsonOutputParser(pydantic_object=DealEvaluation)

            prompt = ChatPromptTemplate.from_messages([
                ("system", "{system_instruction} \n"
                           "You are analyzing items for a Polish user. The listings are from Polish marketplaces (OLX, Allegro). \n"
                           "CONTEXT:\n"
                           "- The search query and user intent are in English or Polish.\n"
                           "- The item title/description are usually in Polish.\n"
                           "- Output formatting and JSON structure must be strict.\n\n"
                           "TASK:\n"
                           "1. Analyze the item's value and relevance.\n"
                           "2. List pros and cons in POLISH. Do not complain about the language being Polish.\n"
                           "3. Provide a market analysis in POLISH.\n"
                           "4. Calculate a score (0-100).\n\n"
                           "IMPORTANT RESPONSE FORMAT:\n"
                           "{format_instructions}\n"
                           "Return ONLY raw JSON. No markdown. No intro."),
                ("user", "Search Query: {query}\n"
                         "User Intent / Specific Requirements: {user_intent}\n"
                         "Item Title: {title}\n"
                         "Item Description: {description}\n"
                         "Price: {price} {currency}\n\n"
                         "Return JSON with 'pros', 'cons', 'market_analysis', 'score' (0-100), and 'summary' object (en, pl)."),
            ])

            self.chain = prompt.partial(format_instructions=parser.get_format_instructions()) | llm | parser
        except Exception as e:
            logger.warning(f"Failed to initialize AI: {e}")
            self.chain = None

    def evaluate_offer(self, query, title, description, price, currency, user_intent: str = "", persona: str = "default"):
        if not self.chain:
            return None, None
        try:
            start_time = time.time()
            intent = user_intent if user_intent else f"Find good deals for {query}"
            
            if persona: 
                 system_instruction = persona
            else:
                 system_instruction = self.default_instruction
            
            result = self.chain.invoke({
                "system_instruction": system_instruction,
                "query": query, 
                "user_intent": intent,
                "title": title, 
                "description": description, 
                "price": price, 
                "currency": currency
            })
            logger.info(f"AI Evaluation took {time.time() - start_time:.2f}s: Score {result.get('score')}")
            return result.get("score"), result
        except Exception as e:
            logger.error(f"AI Evaluation failed: {e}")
            return None, None

ai_service = AIService()

