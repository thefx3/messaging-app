import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MessageInput from "@/components/MessageInput";
import { formatTime } from "@/lib/utils";
import { getViewerServer } from "@/lib/auth/viewer.server";
import { getConversationTitle } from "@/lib/conversations.server";

export default async function ConversationPage(
  props: { params: Promise<{ id: string }> }
) {
  const { id: conversationId } = await props.params;

  if (!conversationId || conversationId === "undefined") {
    return <div>Conversation introuvable</div>;
  }

  const supabase = await createClient();
  const { user } = await getViewerServer();
  if (!user) redirect("/login");

  const { title: conversationTitle, error: titleError } =
    await getConversationTitle(supabase, conversationId, user.id);

  if (titleError) return <pre>{titleError}</pre>;

  const { data: messages, error } = await supabase
    .from("messages")
    .select("id, sender_id, content, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) return <pre>{error.message}</pre>;

  return (
    <main className="p-6 pt-8 space-y-4">
      <h1 className="text-lg font-semibold">{conversationTitle}</h1>

      <div className="space-y-2 rounded-lg border p-4">
        {(messages ?? []).length === 0 ? (
          <div className="text-slate-600 text-sm">Aucun message</div>
        ) : (
          (messages ?? []).map((message) => {
            const isMine = message.sender_id === user.id;

            return (
              <div
                key={message.id}
                className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                  isMine ? "ml-auto bg-black text-white" : "bg-slate-100"
                }`}
              >
                <div>{message.content ?? ""}</div>
                <div className="mt-1 text-xs opacity-70">
                  {formatTime(message.created_at)}
                </div>
              </div>
            );
          })
        )}
      </div>

      <MessageInput conversationId={conversationId} viewerId={user.id} />
    </main>
  );
}
