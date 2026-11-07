"use client";

import React, { useRef, useState } from "react";
import { UploadCloud, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  uploading: boolean;
  onFilesSelected: (files: FileList | null) => void;
}

export function UploadZone({ uploading, onFilesSelected }: UploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    onFilesSelected(e.dataTransfer.files);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilesSelected(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <label
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 text-center transition-colors cursor-pointer",
        uploading
          ? "cursor-wait border-[var(--ring)] bg-[var(--accent)]"
          : isDragging
          ? "border-[var(--ring)] bg-[var(--accent)]"
          : "border-[var(--border)] hover:border-[var(--ring)] hover:bg-[var(--accent)]"
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.txt,.md,.markdown,.csv,.json,.py,.js,.ts,.html,.css"
        className="hidden"
        disabled={uploading}
        onChange={handleChange}
      />

      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)]">
        {uploading ? (
          <Loader2 className="h-5 w-5 animate-spin text-[var(--muted-foreground)]" />
        ) : (
          <UploadCloud className="h-5 w-5 text-[var(--muted-foreground)]" />
        )}
      </div>

      <div>
        <p className="text-sm font-medium text-[var(--foreground)]">
          {uploading ? "Embedding into Chroma…" : "Drop files or click to upload"}
        </p>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          PDF, Markdown, TXT, CSV, JSON, and code files
        </p>
      </div>
    </label>
  );
}
