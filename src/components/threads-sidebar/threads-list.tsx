"use client";

import React from "react";
import { InboxIcon } from "lucide-react";
import { ThreadItem as ThreadItemType } from "./types";
import { ThreadItem } from "./thread-item";

interface ThreadsListProps {
  threads: ThreadItemType[];
  activeThreadId?: string;
  onSelect: (threadId: string) => void;
  onDelete: (threadId: string) => void;
}

export function ThreadsList({
  threads,
  activeThreadId,
  onSelect,
  onDelete,
}: ThreadsListProps) {
  if (threads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--secondary)]">
          <InboxIcon className="h-4 w-4 text-[var(--muted-foreground)]" />
        </div>
        <div>
          <p className="text-xs font-medium text-[var(--foreground)]">No conversations yet</p>
          <p className="mt-0.5 text-[11px] text-[var(--muted-foreground)]">
            Start chatting — threads are saved automatically.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
      {threads.map((thread) => (
        <ThreadItem
          key={thread.id}
          thread={thread}
          isActive={activeThreadId === thread.id}
          onSelect={onSelect}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
