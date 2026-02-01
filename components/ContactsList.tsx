import { createClient } from "@/lib/supabase/server";
import { getDisplayName } from "@/lib/utils";
import StartConversationButton from "@/components/StartConversationButton";
import { getViewerServer } from "@/lib/auth/viewer.server";
import { getExistingConversationIdsByContact } from "@/lib/conversations.server";
import { ROLE_OPTIONS } from "@/lib/users/types";

export default async function ContactsList() {
  const supabase = await createClient();
  const { user } = await getViewerServer();

  if (!user) {
    return <div>Not authenticated</div>;
  }

  const { data: profiles, error } = await supabase
    .from("user_profiles")
    .select("user_id, first_name, last_name, email, role")
    .in("role", ROLE_OPTIONS)
    .order("email");
    // .neq("user_id", user.id);

  if (error) {
    return <pre>{error.message}</pre>;
  }

  if (!profiles || profiles.length === 0) {
    return <div>Aucun contact</div>;
  }

  const contactIds = profiles.map((profile) => profile.user_id);
  const { byContactId, error: conversationsError } =
    await getExistingConversationIdsByContact(supabase, user.id, contactIds);

  if (conversationsError) {
    return <pre>{conversationsError}</pre>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Contacts</h2>

      <div className="space-y-2">
        {profiles.map((profile) => (
          <div
            key={profile.user_id}
            className="flex items-center justify-between gap-3 rounded-lg border p-3"
          >
            <div>
              <div className="text-sm font-medium">
                {getDisplayName(profile)}
              </div>
              <div className="text-xs text-slate-500">{profile.role}</div>
            </div>
            {profile.user_id === user.id ? (
              <span className="text-xs font-semibold text-slate-400">Vous</span>
            ) : (
              <StartConversationButton
                viewerId={user.id}
                contactId={profile.user_id}
                existingConversationId={byContactId.get(profile.user_id)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
