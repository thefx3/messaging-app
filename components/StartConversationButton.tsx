"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, MessageSquarePlus } from "lucide-react";

type StartConversationButtonProps = {
  viewerId: string;
  contactId: string;
  existingConversationId?: string | null;
};

export default function StartConversationButton({
  viewerId,
  contactId,
  existingConversationId,
}: StartConversationButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStart() {
    if (pending) return;

    setPending(true);
    setError(null);

    if (!viewerId || !contactId) {
      setError("Contact invalide.");
      setPending(false);
      return;
    }

    if (viewerId === contactId) {
      setError("Impossible de démarrer une conversation avec vous-même.");
      setPending(false);
      return;
    }

    if (existingConversationId) {
      router.push(`/${existingConversationId}`);
      router.refresh();
      setPending(false);
      return;
    }

    const response = await fetch("/api/conversations/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contactId }),
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      setError(payload?.error ?? "Impossible de créer la conversation.");
      setPending(false);
      return;
    }

    const conversationId = payload?.conversationId;
    if (!conversationId) {
      setError("Conversation introuvable.");
      setPending(false);
      return;
    }

    router.push(`/${conversationId}`);
    router.refresh();
    setPending(false);
  }

  const hasConversation = Boolean(existingConversationId);

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleStart}
        disabled={pending}
        className={
          hasConversation
            ? "inline-flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            : "inline-flex h-9 w-9 items-center justify-center rounded-md border bg-white text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
        }
        aria-label={hasConversation ? "Afficher" : "Nouveau message"}
        title={hasConversation ? "Afficher" : "Nouveau message"}
      >
        {hasConversation ? (
          <>
            <Eye className="h-4 w-4" aria-hidden />
            Afficher
          </>
        ) : (
          <MessageSquarePlus className="h-4 w-4" aria-hidden />
        )}
      </button>
      {error ? <div className="text-xs text-red-600">{error}</div> : null}
    </div>
  );
}
