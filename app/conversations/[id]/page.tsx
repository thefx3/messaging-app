import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MessageInput from "@/components/MessageInput";
import { formatTime } from "@/lib/utils";
import type { UserProfileRow } from "@/lib/users/types";

export default async function ConversationPage( props: { params: Promise<{ id: string }> }) {
  const { id: conversationId } = await props.params;

  const supabase = await createClient();

  const { data: { user }, } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: members, error: membersError } = await supabase
    .from("conversation_members")
    .select("user_id")
    .eq("conversation_id", conversationId)
    .neq("user_id", user.id);

  if (membersError) return <pre>{membersError.message}</pre>;

  const otherUserIds = members?.map((member) => member.user_id) ?? [];
  let conversationTitle = "Conversation";

  if (otherUserIds.length > 0) {
    const { data: profiles, error: profilesError } = await supabase
      .from("user_profiles")
      .select("user_id, first_name, last_name, email")
      .in("user_id", otherUserIds);

    if (profilesError) return <pre>{profilesError.message}</pre>;

    const names = (profiles ?? [])
      .map((profile) => getDisplayName(profile))
      .filter(Boolean);

    if (names.length > 0) {
      conversationTitle = names.join(", ");
    }
  }

  const { data: messages, error } = await supabase
    .from("messages")
    .select("id, sender_id, content, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) return <pre>{error.message}</pre>;

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-lg font-semibold">{conversationTitle}</h1>

      <div className="space-y-2 rounded-lg border p-4">
        {(messages ?? []).length === 0 ? (
          <div className="text-slate-600 text-sm">Aucun message</div>
        ) : (
          (messages ?? []).map((m) => {
            const isMine = m.sender_id === user.id;

            return (
              <div
                key={m.id}
                className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                  isMine ? "ml-auto bg-black text-white" : "bg-slate-100"
                }`}
              >
                <div>{m.content ?? ""}</div>
                <div className="mt-1 text-xs opacity-70">
                  {formatTime(m.created_at)}
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

function getDisplayName(
  profile: Pick<UserProfileRow, "first_name" | "last_name" | "email">,
) {
  const name = [profile.first_name, profile.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  return name || profile.email || "Utilisateur";
}
