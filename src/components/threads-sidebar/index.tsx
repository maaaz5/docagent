"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, PanelLeft } from "lucide-react";
import { useCopilotChatConfiguration } from "@copilotkit/react-core/v2";
import { ThreadItem as ThreadItemType } from "./types";
import { ThreadsHeader } from "./threads-header";
import { ThreadsList } from "./threads-list";

const BUCKET_API = process.env.NEXT_PUBLIC_BUCKET_API_URL || "http://localhost:8000";

export function ThreadsSidebar() {
  const chatConfig = useCopilotChatConfiguration();
  const activeThreadId = chatConfig?.threadId;

  const [threads, setThreads] = useState<ThreadItemType[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const fetchThreads = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BUCKET_API}/api/threads`);
      if (!res.ok) return;
      const data = await res.json();
      setThreads(data.threads || []);
    } catch (err) {
      console.error("Failed to load threads:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchThreads();
    const interval = setInterval(fetchThreads, 6000);
    return () => clearInterval(interval);
  }, [fetchThreads]);

  const handleSelectThread = (threadId: string) => {
    chatConfig?.setActiveThreadId(threadId, { explicit: true });
  };

  const handleNewThread = () => {
    // Standard RFC-compliant UUID accepted by LangGraph
    const newId = crypto.randomUUID();
    chatConfig?.setActiveThreadId(newId, { explicit: true });
  };

  const handleDeleteThread = async (threadId: string) => {
    try {
      await fetch(`${BUCKET_API}/api/threads/${threadId}`, { method: "DELETE" });
      setThreads((prev) => prev.filter((t) => t.id !== threadId));
      if (activeThreadId === threadId) {
        handleNewThread();
      }
    } catch (err) {
      console.error("Failed to delete thread:", err);
    }
  };

  if (isCollapsed) {
    return (
      <div className="w-12 h-full border-r border-[var(--border)] bg-stone-50/50 dark:bg-stone-950/40 flex flex-col items-center py-4 gap-3 shrink-0">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-colors"
          title="Expand sidebar"
        >
          <PanelLeft className="w-4 h-4" />
        </button>
        <button
          onClick={handleNewThread}
          className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
          title="New thread"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-80 h-full border-r border-[var(--border)] bg-stone-50/50 dark:bg-stone-950/40 flex flex-col shrink-0">
      <ThreadsHeader
        loading={loading}
        onRefresh={fetchThreads}
        onCollapse={() => setIsCollapsed(true)}
      />

      {/* New Thread CTA */}
      <div className="p-3">
        <button
          onClick={handleNewThread}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Thread</span>
        </button>
      </div>

      <ThreadsList
        threads={threads}
        activeThreadId={activeThreadId}
        onSelect={handleSelectThread}
        onDelete={handleDeleteThread}
      />


    </div>
  );
}

export * from "./types";