"use client";

import React from "react";
import { MessagesSquare, RefreshCw, PanelLeftClose } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface ThreadsHeaderProps {
  loading: boolean;
  onRefresh: () => void;
  onCollapse: () => void;
}

export function ThreadsHeader({ loading, onRefresh, onCollapse }: ThreadsHeaderProps) {
  return (
    <div className="p-4 pb-3">
      <div className="flex items-center justify-between">
        {/* Title */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--secondary)]">
            <MessagesSquare className="h-4 w-4 text-[var(--muted-foreground)]" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-[var(--foreground)]">
              Conversations
            </span>
            {loading && (
              <RefreshCw className="h-3 w-3 animate-spin text-[var(--muted-foreground)]" />
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            disabled={loading}
            title="Refresh threads"
            className="h-7 w-7"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCollapse}
            title="Collapse sidebar"
            className="h-7 w-7"
          >
            <PanelLeftClose className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <Separator className="mt-3" />
    </div>
  );
}
