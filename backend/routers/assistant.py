from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import User
from schemas import AssistantQuery, AssistantResponse
from auth import require_admin
from ml_service import LocalRAGAssistant

router = APIRouter(prefix="/assistant", tags=["Admin AI Assistant"])

@router.post("", response_model=AssistantResponse)
def ask_assistant(
    query_in: AssistantQuery,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    assistant = LocalRAGAssistant(db)
    response_text, suggested_actions = assistant.query(query_in.message)
    
    return AssistantResponse(
        response=response_text,
        suggested_actions=suggested_actions
    )
