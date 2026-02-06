import os
import secrets
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.responses import FileResponse

from ..database import get_db
from ..models import ChatSession, ChatMessage, GeneratedModel
from ..schemas import GenerateRequest, GenerateResponse
from ..services.gemini_service import gemini_service
from ..services.cadquery_service import execute_cadquery, export_stl

router = APIRouter(
    prefix="/api",
    tags=["generation"]
)

STATIC_DIR = "static"
os.makedirs(STATIC_DIR, exist_ok=True)

@router.get("/")
def api_status():
    return {"status": "ok", "message": "API is running"}

@router.post("/generate", response_model=GenerateResponse)
async def generate_model(request: GenerateRequest, db: Session = Depends(get_db)):
    # 1. Get or Create Session
    if request.session_id:
        session = db.query(ChatSession).filter(ChatSession.id == request.session_id).first()
        if not session:
            # Handle restart if invalid session
            session = ChatSession()
            db.add(session)
            db.commit()
            db.refresh(session)
    else:
        session = ChatSession()
        db.add(session)
        db.commit()
        db.refresh(session)

    # 2. Get history
    history_records = db.query(ChatMessage).filter(ChatMessage.session_id == session.id).order_by(ChatMessage.created_at).all()
    history = []
    for record in history_records:
        history.append({"role": record.role, "content": record.content})
        # If there was code, we might want to include it or the output. 
        # For this MVP, we just send the text content sequence roughly.
        # Ideally we should include the model's code response as 'model' message.
        if record.role == 'model' and record.code_snippet: 
             # Gemini history usually expects text parts
             pass 

    # 3. Generate Code
    try:
        # Add user message to history effectively
        full_history = history # logic needs to be careful about not duplicating
        
        # We invoke the service
        code = await gemini_service.generate_code(request.prompt, history=full_history)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini Error: {str(e)}")

    # 4. Execute Code
    try:
        glb_bytes, result_obj = execute_cadquery(code)
    except Exception as e:
        # Save failure to history so user sees it?
        # For now, return error
        return GenerateResponse(
            session_id=session.id, 
            code=code, 
            glb_url="", 
            error=f"Execution Error: {str(e)}"
        )

    # 5. Save Artifacts
    filename = f"{secrets.token_hex(8)}.glb"
    file_path = os.path.join(STATIC_DIR, filename)
    with open(file_path, "wb") as f:
        f.write(glb_bytes)
        
    # 6. Update DB
    user_msg = ChatMessage(session_id=session.id, role="user", content=request.prompt)
    model_msg = ChatMessage(session_id=session.id, role="model", content="Generated Code", code_snippet=code)
    
    db.add(user_msg)
    db.add(model_msg)
    
    gen_model = GeneratedModel(session_id=session.id, filename=filename, file_path=file_path)
    db.add(gen_model)
    
    db.commit()
    
    return GenerateResponse(
        session_id=session.id,
        code=code,
        glb_url=f"/static/{filename}"
    )

@router.get("/download/{session_id}")
def download_model(session_id: int, format: str = "stl", db: Session = Depends(get_db)):
    # Get latest model for session
    model_record = db.query(GeneratedModel).filter(GeneratedModel.session_id == session_id).order_by(GeneratedModel.created_at.desc()).first()
    
    if not model_record:
        raise HTTPException(status_code=404, detail="No model found for this session")
        
    # If format is GLTF, just return the static file
    if format.lower() in ["gltf", "glb"]:
        return FileResponse(model_record.file_path, filename="model.glb")
        
    # If STL, we need to re-execute or cache STL. 
    # For MVP, let's re-execute the LAST code snippet to get the object, then export.
    # Why re-execute? Because we didn't pickle the object.
    
    # Get last code
    last_msg = db.query(ChatMessage).filter(
        ChatMessage.session_id == session_id, 
        ChatMessage.role == "model"
    ).order_by(ChatMessage.created_at.desc()).first()
    
    if not last_msg or not last_msg.code_snippet:
        raise HTTPException(status_code=404, detail="No code found to regenerate model")
        
    try:
        # Re-execute to get object
        _, result_obj = execute_cadquery(last_msg.code_snippet)
        stl_path = export_stl(result_obj)
        return FileResponse(stl_path, filename="model.stl")
    except Exception as e:
         raise HTTPException(status_code=500, detail=f"Export Error: {str(e)}")
