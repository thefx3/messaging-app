import ConversationList from "@/components/ConversationList";
import ContactsList from "@/components/ContactsList";
import InboxTabs from "@/components/InboxTabs";

export default function InboxLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full min-h-[calc(100vh-64px)]">
      <aside className="w-full max-w-sm border-r bg-white/70 p-4 backdrop-blur">
        <InboxTabs
          conversations={<ConversationList />}
          contacts={<ContactsList />}
        />
      </aside>
      <section className="flex-1">{children}</section>
    </div>
  );
}
