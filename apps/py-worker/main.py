import os
import json
import logging
import time
import requests
from sqlalchemy import create_engine, Column, String, Integer, DateTime, Boolean, DECIMAL, ForeignKey
from sqlalchemy.orm import sessionmaker, declarative_base, relationship
import redis
from olx_scraper import OlxScraper
from uuid import uuid4
from datetime import datetime
from dotenv import load_dotenv
from langchain_community.chat_models import ChatOllama
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field

load_dotenv()

# Setup Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Environment Configuration
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://lifeos:lifeos_password@localhost:5435/lifeos_db")
if "?" in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.split("?")[0]

# Database Models
Base = declarative_base()

class SearchConfig(Base):
    __tablename__ = 'SearchConfig'
    id = Column(String, primary_key=True)

class ScrapedOffer(Base):
    __tablename__ = 'ScrapedOffer'
    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    externalId = Column("externalId", String, nullable=False)
    searchConfigId = Column("searchConfigId", String, nullable=False)
    title = Column(String, nullable=False)
    url = Column(String, nullable=False)
    thumbnailUrl = Column("thumbnailUrl", String, nullable=True)
    description = Column(String, nullable=True)
    detectedAt = Column("detectedAt", DateTime, default=datetime.utcnow)
    lastSeenAt = Column("lastSeenAt", DateTime, default=datetime.utcnow)
    isActive = Column("isActive", Boolean, default=True)
    aiScore = Column("aiScore", Integer, nullable=True)
    aiReasoning = Column("aiReasoning", String, nullable=True)
    
    priceHistory = relationship("OfferPriceHistory", back_populates="offer", cascade="all, delete-orphan")

class OfferPriceHistory(Base):
    __tablename__ = 'OfferPriceHistory'
    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    offerId = Column("offerId", String, ForeignKey('ScrapedOffer.id'), nullable=False)
    price = Column(DECIMAL, nullable=False)
    currency = Column(String, nullable=False)
    recordedAt = Column("recordedAt", DateTime, default=datetime.utcnow)
    offer = relationship("ScrapedOffer", back_populates="priceHistory")

# Initialize
# Note: In production use connection pooling properly (e.g. pgBouncer or SQLAlchemy pool settings)
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=0)

logging.getLogger('httpcore').setLevel(logging.WARNING)
logging.getLogger('httpx').setLevel(logging.WARNING)


def ensure_ollama_model(base_url, model_name="mistral"):
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

scraper = OlxScraper()

# AI Setup
try:
    ollama_base_url = os.getenv("OLLAMA_HOST", "http://ollama:11434")
    ensure_ollama_model(ollama_base_url, "mistral")
    llm = ChatOllama(model="mistral", base_url=ollama_base_url)
    
    class DealEvaluation(BaseModel):
        score: int = Field(description="Score from 0-100 where 100 is an amazing deal and relevant, 0 is spam or irrelevant")
        reasoning: str = Field(description="Short reasoning for the score")

    parser = JsonOutputParser(pydantic_object=DealEvaluation)

    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert car mechanic and parts trader specializing in Mercedes AMG and Jeep. Evaluate if the following item is relevant to the search query and if it's a good deal. Be critical."),
        ("user", "Search Query: {query}\nItem Title: {title}\nPrice: {price} {currency}\n\nReturn JSON with 'score' (0-100) and 'reasoning'."),
    ])

    chain = prompt | llm | parser
except Exception as e:
    logger.warning(f"Failed to initialize AI: {e}")
    chain = None

def evaluate_offer(query, title, price, currency):
    if not chain:
        return None, None
    try:
        start_time = time.time()
        result = chain.invoke({"query": query, "title": title, "price": price, "currency": currency})
        logger.info(f"AI Evaluation took {time.time() - start_time:.2f}s: {result}")
        return result.get("score"), result.get("reasoning")
    except Exception as e:
        logger.error(f"AI Evaluation failed: {e}")
        return None, None

def save_results(config_id, listings, query_text=""):
    session = SessionLocal()
    try:
        # Deduplicate listings by id
        unique_listings = {item['id']: item for item in listings}.values()
        
        for item in unique_listings:
            external_id = str(item['id'])
            item_title = item.get('title')
            item_url = item.get('url')
            raw_price = item.get('price')
            currency = item.get('currency')

            # Check if exists
            existing_offer = session.query(ScrapedOffer).filter(
                ScrapedOffer.externalId == external_id, 
                ScrapedOffer.searchConfigId == config_id
            ).first()

            current_price_float = float(raw_price) if raw_price is not None else None

            if existing_offer:
                existing_offer.lastSeenAt = datetime.utcnow()
                existing_offer.isActive = True
                
                # Check Price Logic
                latest_history = session.query(OfferPriceHistory).filter(
                    OfferPriceHistory.offerId == existing_offer.id
                ).order_by(OfferPriceHistory.recordedAt.desc()).first()
                
                price_changed = False
                if latest_history:
                    # Compare if price differs from last recorded
                    if current_price_float is not None and float(latest_history.price) != current_price_float:
                        price_changed = True
                elif current_price_float is not None:
                     price_changed = True 

                # Re-evaluate AI Score if missing or price changed significantly (e.g. drop)
                if (existing_offer.aiScore is None or price_changed) and query_text:
                    logger.info(f"Re-evaluating AI score for {item_title} due to missing score or price change.")
                    score, reasoning = evaluate_offer(query_text, item_title, raw_price, currency)
                    if score is not None:
                        existing_offer.aiScore = score
                        existing_offer.aiReasoning = reasoning

                if price_changed and current_price_float is not None:
                    logger.info(f"Price change detected for {item_title}: {current_price_float} {currency}")
                    new_history = OfferPriceHistory(
                        id=str(uuid4()),
                        offerId=existing_offer.id,
                        price=current_price_float,
                        currency=currency
                    )
                    session.add(new_history)

            else:
                # New Offer - Evaluate with AI
                score, reasoning = None, None
                if query_text:
                    score, reasoning = evaluate_offer(query_text, item_title, raw_price, currency)

                new_offer_id = str(uuid4())
                new_offer = ScrapedOffer(
                    id=new_offer_id,
                    externalId=external_id,
                    searchConfigId=config_id,
                    title=item_title,
                    url=item_url,
                    thumbnailUrl=item.get('thumbnail'), 
                    description=None,
                    isActive=True,
                    detectedAt=datetime.utcnow(),
                    lastSeenAt=datetime.utcnow(),
                    aiScore=score,
                    aiReasoning=reasoning
                )
                session.add(new_offer)
                
                if current_price_float is not None:
                    initial_price = OfferPriceHistory(
                        id=str(uuid4()),
                        offerId=new_offer_id,
                        price=current_price_float,
                        currency=currency
                    )
                    session.add(initial_price)
                
                logger.info(f"New offer found: {item_title} (AI Score: {score})")
            
            # Commit after each item so results appear incrementally
            session.commit()
        
    except Exception as e:
        logger.error(f"Database error during save: {e}")
        session.rollback()
    finally:
        session.close()

def process_task(task_data):
    config_id = task_data.get("configId")
    query = task_data.get("query")
    
    # Support both camelCase (from NestJS) and snake_case (potential legacy/manual)
    category_id = task_data.get('categoryId') or task_data.get('category_id')
    
    city_id = task_data.get('cityId') or task_data.get('city_id')
    region_id = task_data.get('regionId') or task_data.get('region_id')
    
    # Radius/Distance (default 0 or scraping logic default)
    radius = task_data.get('radius') or task_data.get('dist') or 0

    # Fallback for old tasks that might only have locationId (assuming city)
    location_id = task_data.get('locationId') or task_data.get('location_id')
    if not city_id and not region_id and location_id:
        city_id = location_id
    
    logger.info(f"Processing scrape task: {query} (Config: {config_id}, Radius: {radius})")
    
    try:
        results = scraper.search(query=query, category_id=category_id, city_id=city_id, region_id=region_id, dist=radius)
        
        if isinstance(results, dict) and "error" in results:
             logger.error(f"Scraper returned error: {results['error']}")
             return

        listings = scraper.parse_results(results)
        logger.info(f"Found {len(listings)} listings.")
        
        if listings:
            save_results(config_id, listings, query_text=query)
        
    except Exception as e:
        logger.error(f"Error executing scrape: {e}")

def worker_loop():
    logger.info("Worker started. Waiting for tasks...")
    while True:
        try:
            # Blocking pop
            # brpop returns a tuple (queue_name, data)
            task = redis_client.brpop("task_queue", timeout=5)
            if task:
                # task[1] is the byte string data
                task_data = json.loads(task[1])
                logger.info(f"Received task: {task_data}")
                process_task(task_data)
        except redis.exceptions.ConnectionError:
            logger.error("Redis connection lost. Retrying...")
            time.sleep(5)
        except Exception as e:
            logger.error(f"Worker loop error: {e}")
            time.sleep(1)

if __name__ == "__main__":
    worker_loop()

