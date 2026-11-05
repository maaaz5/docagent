"use client";

import React from "react";
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
      <div className="p-4 text-center text-xs text-stone-400 dark:text-stone-500">
        No conversation history yet. Start chatting to save threads!
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-2 space-y-1">
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