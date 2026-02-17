from fastapi import FastAPI, BackgroundTasks
import asyncio
import os
import redis
from contextlib import asynccontextmanager

app = FastAPI()
redis_client = redis.Redis(host=os.getenv("REDIS_HOST", "localhost"), port=6379, db=0)

async def worker_loop():
    while True:
        try:
            # Simple blocking pop from redis 'task_queue'
            # In production, use Celery or RQ
            task = redis_client.brpop("task_queue", timeout=1)
            if task:
                print(f"Processing task: {task}")
                # Process task here (scraper, AI, etc.)
        except Exception as e:
            print(f"Worker error: {e}")
        await asyncio.sleep(0.1)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Start worker loop in background
    asyncio.create_task(worker_loop())
    yield
    # Shutdown

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.post("/tasks/")
def create_task(task_data: dict, background_tasks: BackgroundTasks):
    # Add task to queue
    redis_client.lpush("task_queue", str(task_data))
    return {"message": "Task queued"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

