"use client";

import React from "react";
import { MessageSquare, RefreshCw, PanelLeftClose } from "lucide-react";

interface ThreadsHeaderProps {
  loading: boolean;
  onRefresh: () => void;
  onCollapse: () => void;
}

export function ThreadsHeader({ loading, onRefresh, onCollapse }: ThreadsHeaderProps) {
  return (
    <div className="p-3 border-b border-[var(--border)] flex items-center justify-between gap-2 shrink-0">
      <div className="flex items-center gap-2 font-semibold text-sm text-stone-800 dark:text-stone-200">
        <MessageSquare className="w-4 h-4 text-blue-500" />
        <span>Conversations</span>
        {loading && <RefreshCw className="w-3 h-3 animate-spin text-stone-400" />}
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={onRefresh}
          className="p-1.5 rounded-md hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-500 transition-colors"
          title="Refresh threads"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onCollapse}
          className="p-1.5 rounded-md hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-500 transition-colors"
          title="Collapse sidebar"
        >
          <PanelLeftClose className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}