"use client";

import React, { useState, useEffect } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { BucketDocument } from "./types";
import { BucketHeader } from "./bucket-header";
import { UploadZone } from "./upload-zone";
import { DocumentList } from "./document-list";

const BUCKET_API = process.env.NEXT_PUBLIC_BUCKET_API_URL || "http://localhost:8000";

export function KnowledgeBucket() {
  const [documents, setDocuments] = useState<BucketDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${BUCKET_API}/api/bucket`);
      if (!res.ok) throw new Error("Failed to load documents from FastAPI");
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load bucket contents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      setError(null);
      setSuccessMsg(null);

      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }

      const res = await fetch(`${BUCKET_API}/api/bucket/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || errorData.error || "Upload failed");
      }

      const result = await res.json();
      setSuccessMsg(`Successfully indexed ${result.indexed?.length || files.length} document(s) into Chroma!`);
      await fetchDocuments();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to upload and index document");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (filename: string) => {
    try {
      setError(null);
      setSuccessMsg(null);
      const res = await fetch(`${BUCKET_API}/api/bucket/${encodeURIComponent(filename)}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Failed to delete");
      }

      setSuccessMsg(`Deleted "${filename}" from Chroma.`);
      setDocuments((prev) => prev.filter((doc) => doc.filename !== filename));
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to delete document");
    }
  };

  const totalChunks = documents.reduce((acc, doc) => acc + (doc.chunks || 0), 0);

  return (
    <div className="h-full flex flex-col bg-stone-900/60 dark:bg-stone-950/80 backdrop-blur border-l border-stone-800 text-stone-100 overflow-y-auto">
      <BucketHeader
        documentCount={documents.length}
        totalChunks={totalChunks}
        loading={loading}
        onRefresh={fetchDocuments}
      />

      <div className="p-6">
        <UploadZone uploading={uploading} onFilesSelected={handleFileUpload} />

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2.5 text-emerald-300 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        <DocumentList documents={documents} onDelete={handleDelete} />
      </div>
    </div>
  );
}