"use client";

import React from "react";
import { InboxIcon } from "lucide-react";
import { BucketDocument } from "./types";
import { DocumentItem } from "./document-item";

interface DocumentListProps {
  documents: BucketDocument[];
  onDelete: (filename: string) => void;
}

export function DocumentList({ documents, onDelete }: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--border)] py-12 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--secondary)]">
          <InboxIcon className="h-5 w-5 text-[var(--muted-foreground)]" />
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--foreground)]">Bucket is empty</p>
          <p className="mt-1 text-xs text-[var(--muted-foreground)] max-w-[22rem] mx-auto">
            Upload documents above — your agent will search and cite them automatically.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          Indexed · {documents.length} file{documents.length !== 1 ? "s" : ""}
        </p>
      </div>
      {documents.map((doc) => (
        <DocumentItem key={doc.filename} document={doc} onDelete={onDelete} />
      ))}
    </div>
  );
}
