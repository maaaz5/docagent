"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { BucketDocument } from "./types";
import { DocumentItem } from "./document-item";

interface DocumentListProps {
  documents: BucketDocument[];
  onDelete: (filename: string) => void;
}

export function DocumentList({ documents, onDelete }: DocumentListProps) {
  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-stone-300 uppercase tracking-wider">
          Indexed Documents ({documents.length})
        </h3>
      </div>

      {documents.length === 0 ? (
        <div className="p-8 text-center rounded-2xl border border-stone-800/80 bg-stone-900/20">
          <Sparkles className="w-8 h-8 text-stone-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-stone-300">Bucket is empty</p>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            Upload your documents above. Your LangGraph agent will search and cite them automatically!
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {documents.map((doc) => (
            <DocumentItem key={doc.filename} document={doc} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}