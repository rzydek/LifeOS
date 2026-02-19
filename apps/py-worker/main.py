import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.worker.main import worker_loop, redis_client

if __name__ == "__main__":
    try:
        worker_loop()
    except KeyboardInterrupt:
        redis_client.close()
        print("Worker stopped.")
