import os
from dotenv import load_dotenv

load_dotenv()

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://lifeos:lifeos_password@localhost:5435/lifeos_db")
if "?" in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.split("?")[0]
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://ollama:11434")
