from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from .database import Base

class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, default="New Session")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, index=True)
    role = Column(String)  # user, model
    content = Column(Text)
    code_snippet = Column(Text, nullable=True) # The code generated, if any
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class GeneratedModel(Base):
    __tablename__ = "generated_models"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, index=True)
    filename = Column(String)
    file_path = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
