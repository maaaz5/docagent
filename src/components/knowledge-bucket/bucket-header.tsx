"use client";

import React from "react";
import { Database, RefreshCw, FileText, Layers } from "lucide-react";

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
    <div className="p-6 border-b border-stone-800/80 bg-stone-900/40">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              Knowledge Bucket
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                FastAPI & Chroma
              </span>
            </h2>
            <p className="text-xs text-stone-400">
              Documents are indexed in Chroma and queried by your LangGraph agent.
            </p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          title="Refresh bucket"
          className="p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800/60 transition disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="p-3 rounded-xl bg-stone-800/40 border border-stone-800 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-stone-400 font-medium">Documents</div>
            <div className="text-base font-bold text-white">{documentCount}</div>
          </div>
        </div>
        <div className="p-3 rounded-xl bg-stone-800/40 border border-stone-800 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-stone-400 font-medium">Vector Chunks</div>
            <div className="text-base font-bold text-white">{totalChunks}</div>
          </div>
        </div>
      </div>
    </div>
  );
}