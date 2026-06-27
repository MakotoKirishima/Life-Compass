from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import ChatLog
from app.schemas import ChatRequest, ChatResponse
from app.gemini import chat_response
from app.auth import get_current_user
from app.models import User

router = APIRouter(prefix="/api/chat", tags=["chat"])

@router.post("/")
def chat(req: ChatRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    answer = chat_response(req.question)
    log = ChatLog(user_id=current_user.id, question=req.question, answer=answer)
    db.add(log)
    db.commit()
    return ChatResponse(answer=answer)
