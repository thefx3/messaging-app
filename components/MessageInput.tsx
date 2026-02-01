"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function MessageInput({
  conversationId,
  viewerId,
}: {
  conversationId: string;
  viewerId: string;
}) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendMessage() {
    const text = content.trim();
    if (!text) return;

    setPending(true);
    setError(null);

    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: viewerId,
      content: text,
    });

    setPending(false);

    if (error) {
      setError(error.message);
      return;
    }

    setContent("");
    router.refresh();
    // pas de realtime encore → tu refresh manuellement
    // (prochaine étape on fera un refresh propre ou realtime)
  }

  return (
    <div className="space-y-2">
      {error && (
        <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <input
          className="flex-1 rounded-md border px-3 py-2"
          placeholder="Écrire un message…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={pending}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
        />

        <button
          className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-60"
          disabled={pending}
          onClick={sendMessage}
        >
          Envoyer
        </button>
      </div>
    </div>
  );
}
