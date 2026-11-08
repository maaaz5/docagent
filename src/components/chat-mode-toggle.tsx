"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Database, Check, ShieldAlert } from "lucide-react";

const BUCKET_API =
  process.env.NEXT_PUBLIC_BUCKET_API_URL || "http://localhost:8000";

export function ChatModeToggle() {
  const [allowGeneralChat, setAllowGeneralChat] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load initial setting on mount
  useEffect(() => {
    // 1. Try local cache first for instant hydration
    const cached = localStorage.getItem("docagent_allow_general_chat");
    if (cached !== null) {
      setAllowGeneralChat(cached === "true");
    }

    // 2. Fetch ground truth from backend
    fetch(`${BUCKET_API}/api/settings`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data.allow_general_chat === "boolean") {
          setAllowGeneralChat(data.allow_general_chat);
          localStorage.setItem(
            "docagent_allow_general_chat",
            String(data.allow_general_chat)
          );
        }
      })
      .catch((err) => {
        console.warn("Could not fetch app settings:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const toggleMode = async () => {
    const nextValue = !allowGeneralChat;
    // Optimistic UI update
    setAllowGeneralChat(nextValue);
    localStorage.setItem("docagent_allow_general_chat", String(nextValue));

    try {
      await fetch(`${BUCKET_API}/api/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allow_general_chat: nextValue }),
      });
    } catch (err) {
      console.error("Failed to update general chat mode:", err);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggleMode}
        type="button"
        title={
          allowGeneralChat
            ? "General Chat is enabled: Assistant can converse and search documents."
            : "Strict Document Mode: Assistant ONLY answers using Knowledge Bucket documents."
        }
        className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all shadow-xs cursor-pointer select-none ${
          allowGeneralChat
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/15"
            : "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/15"
        }`}
      >
        {/* Status Dot */}
        <span className="relative flex h-2 w-2">
          {allowGeneralChat ? (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </>
          ) : (
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          )}
        </span>

        {/* Icon & Label */}
        {allowGeneralChat ? (
          <>
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>General Chat</span>
            <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
              ON
            </span>
          </>
        ) : (
          <>
            <Database className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Strict Docs Only</span>
            <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-amber-500/20 text-[10px] font-semibold text-amber-700 dark:text-amber-300">
              STRICT
            </span>
          </>
        )}
      </button>
    </div>
  );
}

