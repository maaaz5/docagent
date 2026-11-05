"use client";

import React from "react";
import { Trash2 } from "lucide-react";
import { ThreadItem as ThreadItemType } from "./types";

interface ThreadItemProps {
  thread: ThreadItemType;
  isActive: boolean;
  onSelect: (threadId: string) => void;
  onDelete: (threadId: string) => void;
}

export function ThreadItem({ thread, isActive, onSelect, onDelete }: ThreadItemProps) {
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString();
    } catch {
      return "";
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(thread.id);
  };

  return (
    <div
      onClick={() => onSelect(thread.id)}
      className={`group flex items-center justify-between px-3 py-2.5 rounded-lg text-xs cursor-pointer transition-colors ${isActive
          ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-medium border border-blue-200/60 dark:border-blue-900/50"
          : "text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-900/60"
        }`}
    >
      <div className="flex flex-col min-w-0 pr-2">
        <span className="truncate">{thread.title || "Untitled Conversation"}</span>
        <span className="text-[10px] text-stone-400 dark:text-stone-500">
          {formatTime(thread.updated_at)}
        </span>
      </div>
      <button
        onClick={handleDelete}
        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 dark:hover:bg-red-950/60 text-stone-400 hover:text-red-600 transition-opacity"
        title="Delete thread"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}