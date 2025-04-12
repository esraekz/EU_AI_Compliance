# zoku/backend/app/models/invoice.py
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime
import uuid


class InvoiceBase(BaseModel):
    filename: str
    supplier: Optional[str] = None
    status: str = "Pending"


class InvoiceCreate(InvoiceBase):
    pass


class Invoice(InvoiceBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    upload_date: str
    file_url: str
    user_id: str

    class Config:
        orm_mode = True


class InvoiceResponse(BaseModel):
    success: bool
    data: Optional[Invoice] = None
    message: Optional[str] = None


class InvoicesResponse(BaseModel):
    success: bool
    data: Optional[Dict[str, Any]] = None
    message: Optional[str] = None


class ExtractionField(BaseModel):
    id: str
    name: str
    value: str = ""
    confidence: float = 0.0


class ExtractionFieldRequest(BaseModel):
    id: str
    name: str


class ExtractionRequest(BaseModel):
    fields: List[ExtractionFieldRequest]


class ExtractionResponse(BaseModel):
    success: bool
    data: Optional[List[ExtractionField]] = None
    message: Optional[str] = None


class ExportRequest(BaseModel):
    fields: List[ExtractionField]
