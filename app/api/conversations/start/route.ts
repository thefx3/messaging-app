import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 },
    );
  }

  const body = await request.json().catch(() => null);
  const contactId = body?.contactId;

  if (!contactId || typeof contactId !== "string") {
    return NextResponse.json({ error: "Invalid contactId" }, { status: 400 });
  }

  if (!isUuid(contactId)) {
    return NextResponse.json({ error: "Invalid contactId" }, { status: 400 });
  }

  if (contactId === user.id) {
    return NextResponse.json(
      { error: "Cannot start a conversation with yourself." },
      { status: 400 },
    );
  }

  const existingConversationId = await findExistingConversationId(
    user.id,
    contactId,
  );

  if (existingConversationId) {
    return NextResponse.json({ conversationId: existingConversationId });
  }

  const { data: conversation, error: createError } = await supabaseAdmin
    .from("conversations")
    .insert({})
    .select("id")
    .single();

  if (createError || !conversation) {
    return NextResponse.json(
      { error: createError?.message ?? "Failed to create conversation." },
      { status: 500 },
    );
  }

  const { error: membersError } = await supabaseAdmin
    .from("conversation_members")
    .insert([
      { conversation_id: conversation.id, user_id: user.id },
      { conversation_id: conversation.id, user_id: contactId },
    ]);

  if (membersError) {
    return NextResponse.json(
      { error: membersError.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ conversationId: conversation.id });
}

async function findExistingConversationId(viewer: string, contact: string) {
  const { data, error } = await supabaseAdmin
    .from("conversation_members")
    .select("conversation_id, user_id")
    .in("user_id", [viewer, contact]);

  if (error || !data) {
    return null;
  }

  const byConversation = new Map<string, Set<string>>();
  for (const row of data) {
    if (!byConversation.has(row.conversation_id)) {
      byConversation.set(row.conversation_id, new Set());
    }
    byConversation.get(row.conversation_id)?.add(row.user_id);
  }

  for (const [conversationId, members] of byConversation.entries()) {
    if (members.has(viewer) && members.has(contact)) {
      return conversationId;
    }
  }

  return null;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}
