import os
import re

def read_env_file():
    """Read .env file from root directory"""
    env_path = r'E:\system-heuristics\employee_management_system\.env'
    
    if not os.path.exists(env_path):
        raise FileNotFoundError(f".env file not found at {env_path}")
    
    env_vars = {}
    with open(env_path, 'r', encoding='utf-8-sig') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#'):
                # Handle both with and without quotes
                match = re.match(r'^([^=]+)=["\']?(.*?)["\']?$', line)
                if match:
                    key = match.group(1).strip()
                    value = match.group(2).strip()
                    env_vars[key] = value
                elif '=' in line:
                    key, value = line.split('=', 1)
                    env_vars[key.strip()] = value.strip().strip('"\'')
    
    return env_vars

# Read .env file
env_vars = read_env_file()

MONGO_URL = env_vars.get('MONGO_URL')
DB_NAME = env_vars.get('DB_NAME')

if not MONGO_URL or not DB_NAME:
    raise EnvironmentError(
        f"Missing required environment variables. MONGO_URL: {MONGO_URL}, DB_NAME: {DB_NAME}"
    )