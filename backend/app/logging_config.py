import sys
import logging 

LOG_FORMAT = "%(asctime)s - %(levelname)s - %(name)s - %(funcName)s - %(message)s"

logging.basicConfig(
    level=logging.INFO,
    format=LOG_FORMAT,
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

#project specific logger "name"
logger = logging.getLogger("EMPLOYEE_MANAGEMENT_SYSTEM")