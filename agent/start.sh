#!/bin/bash
set -e

shutdown() {
    echo "[backend] Shutting down services..."
    kill -TERM "$BUCKET_PID" 2>/dev/null || true
    kill -TERM "$AGENT_PID" 2>/dev/null || true
    wait "$BUCKET_PID" 2>/dev/null || true
    wait "$AGENT_PID" 2>/dev/null || true
    exit 0
}

trap shutdown SIGTERM SIGINT

echo "[backend] Starting Knowledge Bucket & Threads API on port 8000..."
uvicorn bucket_api:app --host 0.0.0.0 --port 8000 &
BUCKET_PID=$!

echo "[backend] Starting LangGraph Agent on port 8123..."
python serve.py &
AGENT_PID=$!

echo "[backend] Services started (Bucket API PID: $BUCKET_PID, LangGraph Agent PID: $AGENT_PID)"

wait -n $BUCKET_PID $AGENT_PID

