import os
from dotenv import load_dotenv

load_dotenv()

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://lifeos:lifeos_password@localhost:5435/lifeos_db")
if "?" in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.split("?")[0]
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://ollama:11434")

AI_PROVIDER = os.getenv("AI_PROVIDER", "ollama")
AI_MODEL = os.getenv("AI_MODEL", "llama3")

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

CISCO_CLIENT_ID = os.getenv("CISCO_CLIENT_ID")
CISCO_CLIENT_SECRET = os.getenv("CISCO_CLIENT_SECRET")
CISCO_APP_KEY = os.getenv("CISCO_APP_KEY")
CISCO_CHAT_API_BASE_URL = os.getenv("CISCO_CHAT_API_BASE_URL", "https://chat-ai.cisco.com/openai/deployments")
CISCO_OAUTH_URL = os.getenv("CISCO_OAUTH_URL", "https://id.cisco.com/oauth2/default/v1/token")
