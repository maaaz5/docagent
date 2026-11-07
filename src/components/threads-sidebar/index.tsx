"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, PanelLeft } from "lucide-react";
import { useCopilotChatConfiguration } from "@copilotkit/react-core/v2";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
    const interval = setInterval(fetchThreads, 2500);
    return () => clearInterval(interval);
  }, [fetchThreads]);

  const handleSelectThread = (threadId: string) => {
    chatConfig?.setActiveThreadId(threadId, { explicit: true });
  };

  const handleNewThread = () => {
    chatConfig?.startNewThread();
  };

  const handleDeleteThread = async (threadId: string) => {
    try {
      await fetch(`${BUCKET_API}/api/threads/${threadId}`, { method: "DELETE" });
      setThreads((prev) => prev.filter((t) => t.id !== threadId));
      if (activeThreadId === threadId) handleNewThread();
    } catch (err) {
      console.error("Failed to delete thread:", err);
    }
  };

  /* ── Collapsed state ── */
  if (isCollapsed) {
    return (
      <div className="flex h-full w-12 shrink-0 flex-col items-center border-r border-[var(--border)] bg-[var(--background)] py-4 gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(false)}
          title="Expand sidebar"
          className="h-8 w-8"
        >
          <PanelLeft className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          onClick={handleNewThread}
          title="New thread"
          className="h-8 w-8"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  /* ── Expanded state ── */
  return (
    <div className="flex h-full w-72 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--background)]">
      {/* Header */}
      <ThreadsHeader
        loading={loading}
        onRefresh={fetchThreads}
        onCollapse={() => setIsCollapsed(true)}
      />

      {/* New Thread button */}
      <div className="px-3 pb-2">
        <Button
          onClick={handleNewThread}
          className="w-full gap-2"
          size="sm"
        >
          <Plus className="h-3.5 w-3.5" />
          New Thread
        </Button>
      </div>

      {/* Thread list */}
      <ThreadsList
        threads={threads}
        activeThreadId={activeThreadId}
        onSelect={handleSelectThread}
        onDelete={handleDeleteThread}
      />

      {/* Footer */}
      <Separator />
      <p className="px-4 py-2.5 text-center text-[10px] text-[var(--muted-foreground)]">
        SQLite · local persistence
      </p>
    </div>
  );
}

export * from "./types";
