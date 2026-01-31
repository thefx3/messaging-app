### MESSAGERIE INSTANTANNEE ###

## INSTALLATION 

--- LANGUAGES ---

Next.js : npx create-next-app@latest .
Lucide React : npm install lucide-react
Shadcn : npx shadcn@latest init
--> Later : npx shadcn@latest add button input scroll-area avatar
Authentification : npm install @supabase/supabase-js @supabase/ssr

Zod (data validation) : npm install zod
Tanstack/React-Query (later): npm install @tanstack/react-query

==================================
### MVP Minimal Viable Product ###

1. Login 
2. List all the conversations
3. See the conversation
4. Send and receive messages. 
5. Seen / Delivered (optionnal)

------------- LATER -------------- 
1. Add friends
2. Chat with friends
==================================


--- SUPABASE --- 

Table : conversations, conversation_messages, messages

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

create table public.conversation_members (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null,
  last_read_at timestamptz,

  primary key (conversation_id, user_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null,
  content text not null,
  created_at timestamptz not null default now()
);

>> Add index : 
create index on public.messages (conversation_id, created_at desc);
create index on public.conversation_members (user_id);
