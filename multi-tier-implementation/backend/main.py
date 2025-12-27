from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "notes.db"

app = FastAPI(title="Minimal Multi-tier Notes API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS notes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                text TEXT NOT NULL
            )
        """)
        conn.commit()

init_db()

class NoteCreate(BaseModel):
    text: str

@app.get("/")
def home():
    return {"message": "Backend running. Try /notes"}

@app.get("/notes")
def list_notes():
    with sqlite3.connect(DB_PATH) as conn:
        cur = conn.execute("SELECT id, text FROM notes ORDER BY id DESC")
        rows = cur.fetchall()
    return [{"id": r[0], "text": r[1]} for r in rows]

@app.post("/notes", status_code=201)
def add_note(payload: NoteCreate):
    text = payload.text.strip()
    if not text:
        return {"error": "Note cannot be empty."}

    with sqlite3.connect(DB_PATH) as conn:
        cur = conn.execute("INSERT INTO notes(text) VALUES (?)", (text,))
        conn.commit()
        note_id = cur.lastrowid

    return {"id": note_id, "text": text}
#python -m uvicorn main:app --reload --port 8001
