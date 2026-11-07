"use client";

import React, { useState, useEffect } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { BucketDocument } from "./types";
import { BucketHeader } from "./bucket-header";
import { UploadZone } from "./upload-zone";
import { TextInput } from "./text-input";
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
      setError(err.message || "Failed to load bucket contents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocuments(); }, []);

  /* ── File upload ── */
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    try {
      setUploading(true);
      setError(null);
      setSuccessMsg(null);
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) formData.append("files", files[i]);
      const res = await fetch(`${BUCKET_API}/api/bucket/upload`, { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || data.error || "Upload failed");
      }
      const result = await res.json();
      setSuccessMsg(`Indexed ${result.indexed?.length || files.length} document(s) into Chroma.`);
      await fetchDocuments();
    } catch (err: any) {
      setError(err.message || "Failed to upload and index document");
    } finally {
      setUploading(false);
    }
  };

  /* ── Plain-text paste upload ── */
  const handleTextSubmit = async (text: string, label: string) => {
    try {
      setUploading(true);
      setError(null);
      setSuccessMsg(null);
      const blob = new Blob([text], { type: "text/plain" });
      const file = new File([blob], label, { type: "text/plain" });
      const formData = new FormData();
      formData.append("files", file);
      const res = await fetch(`${BUCKET_API}/api/bucket/upload`, { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Upload failed");
      }
      setSuccessMsg(`"${label}" indexed into Chroma.`);
      await fetchDocuments();
    } catch (err: any) {
      setError(err.message || "Failed to index text");
    } finally {
      setUploading(false);
    }
  };

  /* ── Delete ── */
  const handleDelete = async (filename: string) => {
    try {
      setError(null);
      setSuccessMsg(null);
      const res = await fetch(`${BUCKET_API}/api/bucket/${encodeURIComponent(filename)}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Failed to delete");
      }
      setSuccessMsg(`Removed "${filename}" from Chroma.`);
      setDocuments((prev) => prev.filter((doc) => doc.filename !== filename));
    } catch (err: any) {
      setError(err.message || "Failed to delete document");
    }
  };

  const totalChunks = documents.reduce((acc, doc) => acc + (doc.chunks || 0), 0);

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-[var(--background)]">
      <BucketHeader
        documentCount={documents.length}
        totalChunks={totalChunks}
        loading={loading}
        onRefresh={fetchDocuments}
      />

      <Separator />

      <div className="flex flex-col gap-4 p-6">
        {/* File drop zone */}
        <UploadZone uploading={uploading} onFilesSelected={handleFileUpload} />

        {/* Paste text shortcut */}
        <TextInput uploading={uploading} onTextSubmit={handleTextSubmit} />

        {/* Feedback banners */}
        {error && (
          <div className="flex items-start gap-2.5 rounded-lg border border-[var(--destructive)]/30 bg-[var(--destructive)]/10 px-3.5 py-3 text-xs text-[var(--destructive)]">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-start gap-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-3 text-xs text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Document list */}
        <DocumentList documents={documents} onDelete={handleDelete} />
      </div>
    </div>
  );
}
