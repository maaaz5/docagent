"use client";

import React, { useState } from "react";
import {
  FileText,
  FileCode,
  FileSpreadsheet,
  File as FileGeneric,
  Trash2,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BucketDocument } from "./types";

interface DocumentItemProps {
  document: BucketDocument;
  onDelete: (filename: string) => void;
}

function getFileIcon(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf")
    return <FileText className="h-4 w-4 text-rose-500 dark:text-rose-400" />;
  if (["js", "ts", "tsx", "py", "html", "css"].includes(ext))
    return <FileCode className="h-4 w-4 text-violet-500 dark:text-violet-400" />;
  if (["csv", "json"].includes(ext))
    return <FileSpreadsheet className="h-4 w-4 text-amber-500 dark:text-amber-400" />;
  return <FileGeneric className="h-4 w-4 text-[var(--muted-foreground)]" />;
}

function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export function DocumentItem({ document: doc, onDelete }: DocumentItemProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(doc.filename);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="group flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3.5 py-3 transition-colors hover:bg-[var(--accent)]">
      {/* Icon + info */}
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--secondary)]">
          {getFileIcon(doc.filename)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-[var(--foreground)]">
            {doc.filename}
          </p>
          <div className="mt-0.5 flex items-center gap-2">
            <span className="text-xs text-[var(--muted-foreground)]">
              {formatFileSize(doc.size)}
            </span>
            <span className="text-xs text-[var(--muted-foreground)]">·</span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-medium">
              {doc.chunks} {doc.chunks === 1 ? "chunk" : "chunks"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Actions — visible on hover */}
      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {/* Copy filename */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCopy}
          title="Copy filename"
          className="h-7 w-7"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-500" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </Button>

        {/* Delete */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(doc.filename)}
          title="Remove from Chroma"
          className="h-7 w-7 text-[var(--muted-foreground)] hover:text-[var(--destructive)] hover:bg-[var(--destructive)]/10"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
