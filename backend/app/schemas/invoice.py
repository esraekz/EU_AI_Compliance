# zoku/backend/app/schemas/invoice.py

from pydantic import BaseModel

class ExtractionField(BaseModel):
    id: str
    name: str
    value: str
    confidence: float
