from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    app_name: str = "Zoku Backend"
    debug: bool = False
    azure_form_recognizer_key: str = ""
    azure_form_recognizer_endpoint: str = ""

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()
