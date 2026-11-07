"use client";

import React from "react";
import { Database, RefreshCw, FileText, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface BucketHeaderProps {
  documentCount: number;
  totalChunks: number;
  loading: boolean;
  onRefresh: () => void;
}

export function BucketHeader({
  documentCount,
  totalChunks,
  loading,
  onRefresh,
}: BucketHeaderProps) {
  return (
    <div className="p-6 pb-4">
      {/* Title row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--secondary)]">
            <Database className="h-4 w-4 text-[var(--muted-foreground)]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-[var(--foreground)]">
                Knowledge Bucket
              </h2>
              <Badge variant="secondary" className="text-[10px] font-medium">
                Chroma · FastAPI
              </Badge>
            </div>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
              Documents indexed and queried by your RAG agent.
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onRefresh}
          disabled={loading}
          title="Refresh"
          className="shrink-0 h-8 w-8"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <Separator className="mt-4 mb-4" />

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
          <div className="flex items-center gap-2">
            <FileText className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
            <span className="text-xs text-[var(--muted-foreground)]">Documents</span>
          </div>
          <p className="mt-1 text-xl font-bold text-[var(--foreground)]">{documentCount}</p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
          <div className="flex items-center gap-2">
            <Layers className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
            <span className="text-xs text-[var(--muted-foreground)]">Vector Chunks</span>
          </div>
          <p className="mt-1 text-xl font-bold text-[var(--foreground)]">{totalChunks}</p>
        </div>
      </div>
    </div>
  );
}
