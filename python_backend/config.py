import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Settings:
    # API Configuration
    API_TITLE = "Issue Tracker Duplicate Detection API"
    API_VERSION = "1.0.0"
    HOST = "0.0.0.0"
    PORT = 8000

    # CORS Configuration
    ALLOWED_ORIGINS = ["http://localhost:3000"]

    # Gemini API Configuration
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    EMBEDDING_MODEL = "gemini-embedding-001"
    EMBEDDING_DIMENSION = 768

    # Duplicate Detection Configuration
    DUPLICATE_THRESHOLD = 0.8
    MAX_SIMILAR_ISSUES = 3

    # Database Configuration
    CHROMA_DB_PATH = "./chroma_db"
    COLLECTION_NAME = "dq_issues_embeddings"

    # CSV Configuration
    CSV_FILE_PATH = "Data_Steward_New_Data.csv"
    CSV_ENCODING = "ISO-8859-1"
    TICKET_ID_COLUMN = "Ticket ID"
    DESCRIPTION_COLUMN = "Description of DQ Issue"

    # Logging Configuration
    LOG_LEVEL = "INFO"

# Create settings instance
settings = Settings()

# Validation
if not settings.GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in environment variables")
