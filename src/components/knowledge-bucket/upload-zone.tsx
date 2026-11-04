"use client";

import React, { useRef } from "react";
import { UploadCloud } from "lucide-react";

interface UploadZoneProps {
  uploading: boolean;
  onFilesSelected: (files: FileList | null) => void;
}

export function UploadZone({ uploading, onFilesSelected }: UploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    onFilesSelected(e.dataTransfer.files);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilesSelected(e.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <label
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 transition cursor-pointer ${uploading
          ? "border-indigo-500/60 bg-indigo-500/5 cursor-wait"
          : "border-stone-700/80 hover:border-indigo-500/50 hover:bg-stone-800/30 bg-stone-900/30"
        }`}
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

      <div className="p-3 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-3">
        <UploadCloud className={`w-6 h-6 ${uploading ? "animate-bounce" : ""}`} />
      </div>

      <p className="text-sm font-semibold text-white mb-1">
        {uploading ? "Processing & Embedding in Chroma..." : "Upload files to Knowledge Bucket"}
      </p>
      <p className="text-xs text-stone-400 text-center max-w-xs">
        Drag & drop or click to upload. Supports PDF, Markdown, TXT, CSV, JSON, and code files.
      </p>
    </label>
  );
}