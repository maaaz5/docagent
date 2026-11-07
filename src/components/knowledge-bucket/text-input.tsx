"use client";

import React, { useState } from "react";
import { Type, CornerDownRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TextInputProps {
  onTextSubmit: (text: string, label: string) => void;
  uploading: boolean;
}

export function TextInput({ onTextSubmit, uploading }: TextInputProps) {
  const [text, setText] = useState("");
  const [label, setLabel] = useState("");
  const [open, setOpen] = useState(false);

  const handleSubmit = () => {
    if (!text.trim()) return;
    const name = label.trim() || `paste_${Date.now()}.txt`;
    onTextSubmit(text.trim(), name.endsWith(".txt") ? name : name + ".txt");
    setText("");
    setLabel("");
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-2 rounded-lg border border-dashed border-[var(--border)] px-4 py-2.5 text-xs text-[var(--muted-foreground)] transition-colors hover:border-[var(--ring)] hover:text-[var(--foreground)] hover:bg-[var(--accent)]"
      >
        <Type className="h-3.5 w-3.5 shrink-0" />
        <span>Or paste plain text…</span>
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Type className="h-4 w-4 text-[var(--muted-foreground)]" />
        <span className="text-sm font-medium text-[var(--foreground)]">Paste Text</span>
        <button
          onClick={() => setOpen(false)}
          className="ml-auto text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        >
          Cancel
        </button>
      </div>

      {/* Optional label */}
      <input
        type="text"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Label (optional) — e.g. meeting-notes"
        className="w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-1.5 text-xs text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
      />

      {/* Text area */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste your text here…"
        rows={6}
        className="w-full resize-none rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-xs text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] font-mono"
      />

      <Button
        onClick={handleSubmit}
        disabled={!text.trim() || uploading}
        size="sm"
        className="w-full gap-2"
      >
        {uploading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <CornerDownRight className="h-3.5 w-3.5" />
        )}
        Index Text
      </Button>
    </div>
  );
}

