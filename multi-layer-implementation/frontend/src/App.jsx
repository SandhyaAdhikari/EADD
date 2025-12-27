import { useEffect, useState } from "react";
import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const res = await api.get("/tasks");
    setTasks(res.data);
  }

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);

  async function addTask(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/tasks", { title });
      setTitle("");
      await load();
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    }
  }

  async function toggle(id) {
    setError("");
    try {
      await api.post(`/tasks/${id}/toggle`);
      await load();
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", fontFamily: "system-ui" }}>
      <h2>Minimal Multi-layer App</h2>
      <p style={{ opacity: 0.7 }}>React → API → Service → Repository</p>

      <form onSubmit={addTask} style={{ display: "flex", gap: 8 }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New task..."
          style={{ flex: 1, padding: 10 }}
        />
        <button style={{ padding: "10px 14px" }}>Add</button>
      </form>

      {error && <div style={{ color: "crimson", marginTop: 10 }}>{error}</div>}

      <div style={{ marginTop: 20 }}>
        {tasks.map((t) => (
          <div
            key={t.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: 10,
              border: "1px solid #ddd",
              borderRadius: 8,
              marginBottom: 8,
            }}
          >
            <span style={{ textDecoration: t.done ? "line-through" : "none" }}>
              {t.title}
            </span>
            <button onClick={() => toggle(t.id)}>
              {t.done ? "Undo" : "Done"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
