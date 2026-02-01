import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatRelativeTimestamp } from "@/lib/utils";
import { getViewerServer } from "@/lib/auth/viewer.server";
import { getConversationTitlesByConversationId } from "@/lib/conversations.server";

export default async function ConversationList() {
  const supabase = await createClient();
  const { user } = await getViewerServer();

  if (!user) {
    return <div>Not authenticated</div>;
  }

  const { data: memberships, error: membershipsError } = await supabase
    .from("conversation_members")
    .select("conversation_id")
    .eq("user_id", user.id);

  if (membershipsError) {
    return <pre>{membershipsError.message}</pre>;
  }

  const conversationIds = memberships?.map((m) => m.conversation_id) ?? [];
  if (conversationIds.length === 0) {
    return <div>Aucune conversation</div>;
  }

  const { titles: titlesByConversationId, error: titlesError } =
    await getConversationTitlesByConversationId(
      supabase,
      conversationIds,
      user.id,
    );

  if (titlesError) {
    return <pre>{titlesError}</pre>;
  }

  const { data: conversations, error: conversationsError } = await supabase
    .from("conversations")
    .select(
      "id, created_at, last_message_at, last_message_preview, last_message_sender_id",
    )
    .in("id", conversationIds);

  if (conversationsError) {
    return <pre>{conversationsError.message}</pre>;
  }

  const items = (conversations ?? []).sort((a, b) => {
    const aTime = a.last_message_at
      ? new Date(a.last_message_at).getTime()
      : a.created_at
        ? new Date(a.created_at).getTime()
        : 0;

    const bTime = b.last_message_at
      ? new Date(b.last_message_at).getTime()
      : b.created_at
        ? new Date(b.created_at).getTime()
        : 0;

    return bTime - aTime;
  });

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Conversations</h2>

      <div className="space-y-3">
        {items.map((conversation) => {
          const isSentByMe = conversation.last_message_sender_id === user.id;
          const title =
            titlesByConversationId.get(conversation.id) ?? "Conversation";

          return (
            <Link
              key={conversation.id}
              href={`/${conversation.id}`}
              className="block rounded-lg border p-3 hover:bg-slate-50"
            >
              <div className="text-sm font-medium">{title}</div>

              {conversation.last_message_at ? (
                <>
                  <div className="text-sm text-slate-700">
                    {isSentByMe ? "Envoyé" : "Reçu"} ·{" "}
                    {conversation.last_message_preview || "Message vide"}
                  </div>
                  <div className="text-xs text-slate-600">
                    {formatRelativeTimestamp(conversation.last_message_at)}
                  </div>
                </>
              ) : (
                <div className="text-sm text-slate-600">
                  Pas encore de messages
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
