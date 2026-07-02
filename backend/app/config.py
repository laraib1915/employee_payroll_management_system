"This file is your central configuration hub.It reads values from .env and provides them to the whole backend."
from os import environ
from dotenv import load_dotenv

load_dotenv()

MONGO_URL: str = environ["MONGO_URL"]
DB_NAME: str = environ["DB_NAME"]

if not MONGO_URL or not DB_NAME:
    raise EnvironmentError(
        "Missing required environment variables: MONGO_URL and DB_NAME"
    )