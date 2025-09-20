import re
import logging

logger = logging.getLogger(__name__)

def load_sql_query(query_name: str, file_path: str = 'queries.sql') -> str:
    try:
        with open(file_path, 'r') as f:
            content = f.read()
        query_pattern = rf'-- {re.escape(query_name)}\s*([\s\S]*?)(?=--|\Z)'
        match = re.search(query_pattern, content)
        if match:
            return match.group(1).strip()
        raise ValueError(f"Query '{query_name}' not found in {file_path}")
    except FileNotFoundError:
        logger.error(f"SQL file not found at {file_path}")
        raise
