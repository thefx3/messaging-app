import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatTime } from "@/lib/utils";
import type { UserProfileRow } from "@/lib/users/types";

export default async function Conversations() {
  const supabase = await createClient();
  const { data: { user }, } = await supabase.auth.getUser();
  if (!user) return <div>Not authenticated</div>;
  

  // 1) récupérer mes conversation_id
  const { data: memberships, error: membershipsError } = await supabase
    .from("conversation_members")
    .select("conversation_id")
    .eq("user_id", user.id);

  if (membershipsError) return <pre>{membershipsError.message}</pre>;

  const conversationIds = memberships?.map((m) => m.conversation_id) ?? [];
  if (conversationIds.length === 0) return <div>Aucune conversation</div>;

  const { data: otherMembers, error: otherMembersError } = await supabase
    .from("conversation_members")
    .select("conversation_id, user_id")
    .in("conversation_id", conversationIds)
    .neq("user_id", user.id);

  if (otherMembersError) return <pre>{otherMembersError.message}</pre>;

  const otherUserIds = Array.from(
    new Set((otherMembers ?? []).map((member) => member.user_id)),
  );

  const { data: profiles, error: profilesError } = await supabase
    .from("user_profiles")
    .select("user_id, first_name, last_name, email")
    .in("user_id", otherUserIds);

  if (profilesError) return <pre>{profilesError.message}</pre>;

  const profileById = new Map(
    (profiles ?? []).map((profile) => [profile.user_id, profile]),
  );
  const namesByConversation = new Map<string, string[]>();

  for (const member of otherMembers ?? []) {
    const profile = profileById.get(member.user_id);
    if (!profile) continue;
    const name = getDisplayName(profile);
    if (!namesByConversation.has(member.conversation_id)) {
      namesByConversation.set(member.conversation_id, []);
    }
    namesByConversation.get(member.conversation_id)?.push(name);
  }

  // 2) récupérer les conversations + last message (stocké en DB)
  const { data: conversations, error: conversationsError } = await supabase
    .from("conversations")
    .select("id, created_at, last_message_at, last_message_preview, last_message_sender_id",)
    .in("id", conversationIds);

  if (conversationsError) return <pre>{conversationsError.message}</pre>;

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
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Conversations</h1>

      <div className="space-y-3">
        {items.map((c) => {
          const isSentByMe = c.last_message_sender_id === user.id;
          const names = namesByConversation.get(c.id) ?? [];
          const title = names.length > 0 ? names.join(", ") : "Conversation";

          return (
            <Link
              key={c.id}
              href={`/conversations/${c.id}`}
              className="block rounded-lg border p-3 hover:bg-slate-50"
            >
              <div className="text-sm font-medium">{title}</div>

              {c.last_message_at ? (
                <>
                  <div className="text-sm text-slate-700">
                    {isSentByMe ? "Envoyé" : "Reçu"} ·{" "}
                    {c.last_message_preview || "Message vide"}
                  </div>
                  <div className="text-xs text-slate-600">
                    {formatTime(c.last_message_at)}
                  </div>
                </>
              ) : (
                <div className="text-sm text-slate-600">Pas encore de messages</div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function getDisplayName(profile: Pick<UserProfileRow, "first_name" | "last_name" | "email">) {
  const name = [profile.first_name, profile.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  return name || profile.email || "Utilisateur";
}

