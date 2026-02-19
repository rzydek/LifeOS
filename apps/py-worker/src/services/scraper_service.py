import json
from datetime import datetime
from uuid import uuid4
from sqlalchemy.orm import Session
from src.database.models import ScrapedOffer, OfferPriceHistory
from src.services.ai_service import ai_service
from src.utils.logger import logger
from src.scrapers.factory import ScraperFactory

class ScraperService:
    def process_task(self, db: Session, task_data: dict):
        config_id = task_data.get("configId")
        query = task_data.get("query")
        user_intent = task_data.get("userIntent", "")
        persona = task_data.get("persona") 
        
        if not query:
            logger.error("Task missing 'query' parameter.")
            return

        source = task_data.get("source", "olx")
        
        try:
            scraper = ScraperFactory.get_scraper(source)
        except ValueError as e:
            logger.error(f"Scraper error: {e}")
            return

        parameters = task_data.get('parameters', {})
        
        logger.info(f"Processing scrape task: {query} (Config: {config_id}, Params: {parameters}, Source: {source}, Persona: {persona})")
        
        try:
            results = scraper.search(query=query, **parameters)
            
            if isinstance(results, dict) and "error" in results:
                 logger.error(f"Scraper returned error: {results['error']}")
                 return

            listings = scraper.parse_results(results)
            logger.info(f"Found {len(listings)} listings from {source}.")
            
            if listings:
                self.save_results(db, config_id, listings, query_text=query, user_intent=user_intent, persona=persona)
            
        except Exception as e:
            logger.error(f"Error executing scrape: {e}")

    def save_results(self, session: Session, config_id, listings, query_text="", user_intent="", persona="default"):

        try:
            unique_listings = {item['id']: item for item in listings}.values()
            
            for item in unique_listings:
                external_id = str(item['id'])
                item_title = item.get('title')
                item_description = item.get('description', '')
                item_url = item.get('url')
                raw_price = item.get('price')
                currency = item.get('currency')

                existing_offer = session.query(ScrapedOffer).filter(
                    ScrapedOffer.externalId == external_id, 
                    ScrapedOffer.searchConfigId == config_id
                ).first()

                current_price_float = float(raw_price) if raw_price is not None else None

                if existing_offer:
                    existing_offer.lastSeenAt = datetime.utcnow()
                    existing_offer.isActive = True
                    if not existing_offer.description and item_description:
                         existing_offer.description = item_description
                    
                    latest_history = session.query(OfferPriceHistory).filter(
                        OfferPriceHistory.offerId == existing_offer.id
                    ).order_by(OfferPriceHistory.recordedAt.desc()).first()
                    
                    price_changed = False
                    if latest_history:
                        if current_price_float is not None and float(latest_history.price) != current_price_float:
                            price_changed = True
                    elif current_price_float is not None:
                         price_changed = True 

                    if (existing_offer.aiScore is None or price_changed) and query_text:
                        logger.info(f"Re-evaluating AI score for {item_title} due to missing score or price change. Persona: {persona}")
                        score, reasoning = ai_service.evaluate_offer(query_text, item_title, item_description, raw_price, currency, user_intent=user_intent, persona=persona)
                        if score is not None:
                            existing_offer.aiScore = score
                            existing_offer.aiReasoning = json.dumps(reasoning) if reasoning else None

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
                    score, reasoning = None, None
                    if query_text:
                        score, reasoning = ai_service.evaluate_offer(query_text, item_title, item_description, raw_price, currency, user_intent=user_intent, persona=persona)

                    new_offer_id = str(uuid4())
                    new_offer = ScrapedOffer(
                        id=new_offer_id,
                        externalId=external_id,
                        searchConfigId=config_id,
                        title=item_title,
                        url=item_url,
                        thumbnailUrl=item.get('thumbnail'), 
                        description=item_description,
                        isActive=True,
                        detectedAt=datetime.utcnow(),
                        lastSeenAt=datetime.utcnow(),
                        aiScore=score,
                        aiReasoning=json.dumps(reasoning) if reasoning else None
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

scraper_service = ScraperService()
