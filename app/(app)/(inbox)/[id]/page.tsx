import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MessageInput from "@/components/MessageInput";
import MessageList from "@/components/MessageList";
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

      <div className="rounded-lg border p-4">
        {(messages ?? []).length === 0 ? (
          <div className="text-slate-600 text-sm">Aucun message</div>
        ) : (
          <MessageList messages={messages ?? []} viewerId={user.id} />
        )}
      </div>

      <MessageInput conversationId={conversationId} viewerId={user.id} />
    </main>
  );
}
