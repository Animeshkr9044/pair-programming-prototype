from sqlalchemy import Column, Integer, String, Text
from app.db.base import Base

class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(String, unique=True, index=True)
    code_content = Column(Text, default="")  # Stores the latest code snapshot