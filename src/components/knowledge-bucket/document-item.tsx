"use client";

import React from "react";
import {
  FileText,
  FileCode,
  FileSpreadsheet,
  File as FileGeneric,
  Trash2,
} from "lucide-react";
import { BucketDocument } from "./types";

interface DocumentItemProps {
  document: BucketDocument;
  onDelete: (filename: string) => void;
}

export function DocumentItem({ document: doc, onDelete }: DocumentItemProps) {
  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return <FileText className="w-5 h-5 text-rose-500" />;
    if (["js", "ts", "tsx", "py", "html", "css"].includes(ext || ""))
      return <FileCode className="w-5 h-5 text-indigo-400" />;
    if (["csv", "json"].includes(ext || ""))
      return <FileSpreadsheet className="w-5 h-5 text-amber-500" />;
    return <FileGeneric className="w-5 h-5 text-emerald-400" />;
  };

  return (
    <div className="flex items-center justify-between p-3.5 rounded-xl border border-stone-800 bg-stone-900/40 hover:bg-stone-800/40 transition group">
      <div className="flex items-center gap-3 min-w-0 pr-3">
        <div className="p-2 rounded-lg bg-stone-800 border border-stone-700/60 shrink-0">
          {getFileIcon(doc.filename)}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-white truncate">{doc.filename}</p>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-stone-400">
            <span>{formatFileSize(doc.size)}</span>
            <span>•</span>
            <span className="text-indigo-400 font-medium">
              {doc.chunks} {doc.chunks === 1 ? "chunk" : "chunks"}
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={() => onDelete(doc.filename)}
        title="Remove from Chroma"
        className="p-2 text-stone-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}