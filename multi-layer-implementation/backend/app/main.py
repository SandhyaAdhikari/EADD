from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# -------------------------
# Repository Layer
# -------------------------
class TaskRepo:
    def __init__(self):
        self._tasks = []
        self._next_id = 1

    def list_tasks(self):
        return self._tasks

    def add_task(self, title: str):
        task = {"id": self._next_id, "title": title, "done": False}
        self._next_id += 1
        self._tasks.append(task)
        return task

    def toggle_done(self, task_id: int):
        for t in self._tasks:
            if t["id"] == task_id:
                t["done"] = not t["done"]
                return t
        return None


# -------------------------
# Service Layer
# -------------------------
class TaskService:
    def __init__(self, repo: TaskRepo):
        self.repo = repo

    def list_tasks(self):
        return self.repo.list_tasks()

    def create_task(self, title: str):
        title = title.strip()
        if not title:
            raise ValueError("Title cannot be empty.")
        return self.repo.add_task(title)

    def toggle_task(self, task_id: int):
        task = self.repo.toggle_done(task_id)
        if task is None:
            raise LookupError("Task not found.")
        return task


# -------------------------
# API Layer
# -------------------------
app = FastAPI(title="Minimal Multi-layer App")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

repo = TaskRepo()
service = TaskService(repo)


class TaskCreate(BaseModel):
    title: str


@app.get("/tasks")
def get_tasks():
    return service.list_tasks()


@app.post("/tasks", status_code=201)
def create_task(payload: TaskCreate):
    try:
        return service.create_task(payload.title)
    except ValueError as e:
        return {"error": str(e)}


@app.post("/tasks/{task_id}/toggle")
def toggle_task(task_id: int):
    try:
        return service.toggle_task(task_id)
    except LookupError as e:
        return {"error": str(e)}



#python -m uvicorn app.main:app --reload --port 8000