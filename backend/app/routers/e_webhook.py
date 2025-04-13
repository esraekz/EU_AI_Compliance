# app/routers/webhook.py

from fastapi import APIRouter, Request, BackgroundTasks, Depends, HTTPException
import logging
from pydantic import BaseModel
from typing import Dict, Any, Optional

from app.services.document_indexer import process_invoice
from app.auth.auth_handler import get_current_user

router = APIRouter(
    prefix="/webhooks",
    tags=["webhooks"]
)

logger = logging.getLogger(__name__)

class WebhookPayload(BaseModel):
    """Schema for incoming webhook payload"""
    type: str
    table: str
    record: Dict[str, Any]
    schema: Optional[str] = None
    old_record: Optional[Dict[str, Any]] = None

@router.post("/invoice-created")
async def invoice_created_webhook(
    payload: WebhookPayload,
    background_tasks: BackgroundTasks
):
    """
    Webhook endpoint triggered by Supabase when a new invoice is created
    """
    try:
        # Verify this is an insert on the invoices table
        if payload.type != "INSERT" or payload.table != "invoices":
            logger.warning(f"Unexpected webhook payload: {payload.type} on {payload.table}")
            return {"status": "ignored", "message": "Not an invoice insert event"}

        # Extract the invoice ID from the payload
        invoice_id = payload.record.get("id")

        if not invoice_id:
            logger.error("Webhook payload missing invoice ID")
            return {"status": "error", "message": "No invoice ID found in payload"}

        # Process the invoice in the background
        # This allows the webhook to return quickly while processing happens asynchronously
        background_tasks.add_task(process_invoice, invoice_id)

        logger.info(f"Started background processing for invoice {invoice_id}")
        return {"status": "success", "message": f"Processing started for invoice {invoice_id}"}

    except Exception as e:
        logger.error(f"Error processing webhook: {str(e)}")
        return {"status": "error", "message": f"Error processing webhook: {str(e)}"}
