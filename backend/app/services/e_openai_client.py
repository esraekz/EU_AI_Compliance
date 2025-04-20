import os
import logging
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get API key from environment variables
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise ValueError("OpenAI API key not found in environment variables")

# Initialize OpenAI client
client = OpenAI(api_key=api_key)

async def get_embeddings(text):
    """
    Generate embeddings for the given text using OpenAI's embedding model.

    Args:
        text (str): The text to generate embeddings for

    Returns:
        list: The embedding vector
    """
    try:
        response = client.embeddings.create(
            input=text,
            model="text-embedding-ada-002"
        )

        # Extract the embedding vector from the response
        embedding = response.data[0].embedding

        return embedding
    except Exception as e:
        logger.error(f"Error generating embeddings: {str(e)}")
        raise
