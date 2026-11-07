"use client";

import React from "react";
import { Trash2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThreadItem as ThreadItemType } from "./types";

interface ThreadItemProps {
  thread: ThreadItemType;
  isActive: boolean;
  onSelect: (threadId: string) => void;
  onDelete: (threadId: string) => void;
}

function formatTime(isoString: string): string {
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
}

export function ThreadItem({ thread, isActive, onSelect, onDelete }: ThreadItemProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(thread.id);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(thread.id)}
      onKeyDown={(e) => e.key === "Enter" && onSelect(thread.id)}
      className={cn(
        "group flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors outline-none",
        isActive
          ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
          : "text-[var(--foreground)] hover:bg-[var(--secondary)]"
      )}
    >
      {/* Chat icon */}
      <MessageSquare
        className={cn(
          "h-3.5 w-3.5 shrink-0",
          isActive ? "text-[var(--accent-foreground)]" : "text-[var(--muted-foreground)]"
        )}
      />

      {/* Title + timestamp */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium leading-tight">
          {thread.title || "Untitled Conversation"}
        </p>
        <p className="mt-0.5 text-[10px] text-[var(--muted-foreground)]">
          {formatTime(thread.updated_at)}
        </p>
      </div>

      {/* Delete — appears on hover */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDelete}
        title="Delete thread"
        className={cn(
          "h-6 w-6 shrink-0 opacity-0 transition-opacity group-hover:opacity-100",
          "text-[var(--muted-foreground)] hover:text-[var(--destructive)] hover:bg-[var(--destructive)]/10"
        )}
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
}
