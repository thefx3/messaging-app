import "server-only";

import { createClient } from "@/lib/supabase/server";
import { getDisplayName } from "@/lib/utils";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export async function getConversationTitlesByConversationId(
  supabase: SupabaseClient,
  conversationIds: string[],
  viewerId: string,
) {
  if (conversationIds.length === 0) {
    return { titles: new Map<string, string>(), error: null };
  }

  const { data: otherMembers, error: membersError } = await supabase
    .from("conversation_members")
    .select("conversation_id, user_id")
    .in("conversation_id", conversationIds)
    .neq("user_id", viewerId);

  if (membersError) {
    return { titles: new Map<string, string>(), error: membersError.message };
  }

  const otherUserIds = Array.from(
    new Set((otherMembers ?? []).map((member) => member.user_id)),
  );

  if (otherUserIds.length === 0) {
    return { titles: new Map<string, string>(), error: null };
  }

  const { data: profiles, error: profilesError } = await supabase
    .from("user_profiles")
    .select("user_id, first_name, last_name, email")
    .in("user_id", otherUserIds);

  if (profilesError) {
    return { titles: new Map<string, string>(), error: profilesError.message };
  }

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

  const titles = new Map<string, string>();
  for (const [conversationId, names] of namesByConversation.entries()) {
    if (names.length > 0) {
      titles.set(conversationId, names.join(", "));
    }
  }

  return { titles, error: null };
}

export async function getConversationTitle(
  supabase: SupabaseClient,
  conversationId: string,
  viewerId: string,
) {
  const { titles, error } = await getConversationTitlesByConversationId(
    supabase,
    [conversationId],
    viewerId,
  );
  return { title: titles.get(conversationId) ?? "Conversation", error };
}

export async function getExistingConversationIdsByContact(
  supabase: SupabaseClient,
  viewerId: string,
  contactIds: string[],
) {
  if (contactIds.length === 0) {
    return { byContactId: new Map<string, string>(), error: null };
  }

  const { data, error } = await supabase
    .from("conversation_members")
    .select("conversation_id, user_id")
    .in("user_id", [viewerId, ...contactIds]);

  if (error || !data) {
    return { byContactId: new Map<string, string>(), error: error?.message };
  }

  const byConversation = new Map<string, Set<string>>();
  for (const row of data) {
    if (!byConversation.has(row.conversation_id)) {
      byConversation.set(row.conversation_id, new Set());
    }
    byConversation.get(row.conversation_id)?.add(row.user_id);
  }

  const contactSet = new Set(contactIds);
  const byContactId = new Map<string, string>();

  for (const [conversationId, members] of byConversation.entries()) {
    if (!members.has(viewerId)) continue;
    for (const memberId of members) {
      if (memberId !== viewerId && contactSet.has(memberId)) {
        byContactId.set(memberId, conversationId);
      }
    }
  }

  return { byContactId, error: null };
}
