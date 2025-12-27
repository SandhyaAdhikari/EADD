import { useEffect, useState } from "react";
import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8001",
});

export default function App() {
  const [notes, setNotes] = useState([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const res = await api.get("/notes");
    setNotes(res.data);
  }

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);

  async function addNote(e) {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/notes", { text });
      if (res.data?.error) {
        setError(res.data.error);
        return;
      }
      setText("");
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", fontFamily: "system-ui" }}>
      <h2>Minimal Multi-tier App</h2>
      <p style={{ opacity: 0.7 }}>
        Client (React) → Server (FastAPI) → Data (SQLite)
      </p>

      <form onSubmit={addNote} style={{ display: "flex", gap: 8 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a note..."
          style={{ flex: 1, padding: 10 }}
        />
        <button style={{ padding: "10px 14px" }}>Add</button>
      </form>

      {error && <div style={{ color: "crimson", marginTop: 10 }}>{error}</div>}

      <div style={{ marginTop: 20 }}>
        {notes.map((n) => (
          <div
            key={n.id}
            style={{
              padding: 10,
              border: "1px solid #ddd",
              borderRadius: 8,
              marginBottom: 8,
            }}
          >
            {n.text}
            <div style={{ fontSize: 12, opacity: 0.6 }}>Note #{n.id}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
