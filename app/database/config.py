import os
from pathlib import Path

from dotenv import load_dotenv
from supabase import create_client


# Project root = Ico-AI-Supabase/
BASE_DIR = Path(__file__).resolve().parents[2]

# Load .env from project root
ENV_FILE = BASE_DIR / ".env"

load_dotenv(ENV_FILE)


SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_PUBLISHABLE_KEY") or os.getenv("SUPABASE_KEY")


if not SUPABASE_URL:
    raise RuntimeError("SUPABASE_URL is missing from .env")

if not SUPABASE_KEY:
    raise RuntimeError("SUPABASE_PUBLISHABLE_KEY or SUPABASE_KEY is missing from .env")


supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
