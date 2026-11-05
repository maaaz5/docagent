import sqlite3
from pathlib import Path
from datetime import datetime
from typing import Optional, List, Dict, Any

DB_PATH = Path(__file__).resolve().parent.parent / "threads.db"


def init_db():
  """Initialize SQLite tables for threads and conversation messages."""
  with sqlite3.connect(DB_PATH) as conn:
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.execute("""
        CREATE TABLE IF NOT EXISTS threads (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            thread_id TEXT NOT NULL,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE
        );
    """)
    conn.commit()


init_db()


def list_threads() -> List[Dict[str, Any]]:
  """Return all conversation threads ordered by most recent."""
  with sqlite3.connect(DB_PATH) as conn:
    conn.row_factory = sqlite3.Row
    cursor = conn.execute(
        "SELECT id, title, created_at, updated_at FROM threads ORDER BY updated_at DESC"
    )
    return [dict(row) for row in cursor.fetchall()]


def upsert_thread(thread_id: str, title: Optional[str] = None) -> Dict[str, Any]:
  """Create a new thread or update an existing thread's title."""
  now = datetime.utcnow().isoformat()
  thread_title = title or "New Conversation"
  with sqlite3.connect(DB_PATH) as conn:
    conn.execute(
        """
        INSERT INTO threads (id, title, created_at, updated_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            title = excluded.title,
            updated_at = excluded.updated_at
        """,
        (thread_id, thread_title, now, now),
    )
    conn.commit()
  return {"id": thread_id, "title": thread_title, "updated_at": now}


def delete_thread(thread_id: str) -> bool:
  """Delete a thread and cascade delete all its messages."""
  with sqlite3.connect(DB_PATH) as conn:
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.execute("DELETE FROM threads WHERE id = ?", (thread_id,))
    conn.commit()
  return True


def get_messages(thread_id: str) -> List[Dict[str, Any]]:
  """Retrieve full chronological conversation history for a thread."""
  with sqlite3.connect(DB_PATH) as conn:
    conn.row_factory = sqlite3.Row
    cursor = conn.execute(
        "SELECT id, role, content, created_at FROM messages WHERE thread_id = ? ORDER BY id ASC",
        (thread_id,),
    )
    return [dict(row) for row in cursor.fetchall()]


def add_message(thread_id: str, role: str, content: str) -> Dict[str, Any]:
  """Append a user or assistant message and update thread timestamp/title."""
  now = datetime.utcnow().isoformat()
  with sqlite3.connect(DB_PATH) as conn:
    conn.execute("PRAGMA foreign_keys = ON;")

    # Ensure thread exists; if new, derive title from first prompt preview
    cursor = conn.execute("SELECT id, title FROM threads WHERE id = ?", (thread_id,))
    row = cursor.fetchone()

    if not row:
      title = content[:35] + ("..." if len(content) > 35 else "")
      conn.execute(
          "INSERT INTO threads (id, title, created_at, updated_at) VALUES (?, ?, ?, ?)",
          (thread_id, title or "New Conversation", now, now),
      )
    else:
      if row[1] == "New Conversation" and role == "user":
        new_title = content[:35] + ("..." if len(content) > 35 else "")
        conn.execute(
            "UPDATE threads SET title = ?, updated_at = ? WHERE id = ?",
            (new_title, now, thread_id),
        )
      else:
        conn.execute("UPDATE threads SET updated_at = ? WHERE id = ?", (now, thread_id))

    cursor = conn.execute(
        "INSERT INTO messages (thread_id, role, content, created_at) VALUES (?, ?, ?, ?)",
        (thread_id, role, content, now),
    )
    msg_id = cursor.lastrowid
    conn.commit()

  return {
    "id": msg_id,
    "thread_id": thread_id,
    "role": role,
    "content": content,
    "created_at": now,
  }