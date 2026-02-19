import json
import time
from typing import Optional, Tuple
from redis import Redis, ConnectionError
from src.config import REDIS_HOST, REDIS_PORT
from src.utils.logger import logger
from src.database.connection import SessionLocal
from src.services.scraper_service import scraper_service

redis_client: Redis = Redis(host=REDIS_HOST, port=REDIS_PORT, db=0)

def worker_loop():
    logger.info("Worker started. Waiting for tasks...")
    while True:
        try:
            task: Optional[Tuple[bytes, bytes]] = redis_client.brpop(["task_queue"], timeout=5) # type: ignore
            if task:
                task_data = json.loads(task[1])
                logger.info(f"Received task: {task_data}")
                
                db = SessionLocal()
                try:
                    scraper_service.process_task(db, task_data)
                finally:
                    db.close()
                    
        except ConnectionError:
            logger.error("Redis connection lost. Retrying...")
            time.sleep(5)
        except Exception as e:
            logger.error(f"Worker loop error: {e}")
            time.sleep(1)

if __name__ == "__main__":
    worker_loop()
