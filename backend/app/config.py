"This file is your central configuration hub.It reads values from .env and provides them to the whole backend."
from os import environ
from dotenv import load_dotenv

load_dotenv()

MONGO_URL: str = environ["MONGO_URL"]
DB_NAME: str = environ["DB_NAME"]