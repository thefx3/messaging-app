"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type InboxTabsProps = {
  conversations: React.ReactNode;
  contacts: React.ReactNode;
};

type TabKey = "conversations" | "contacts";

export default function InboxTabs({ conversations, contacts, }: InboxTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("conversations");

  const tabsWrapperClass =
    "mb-4 flex w-full rounded-md bg-[var(--grey)] p-1 inset-shadow-md";

  return (
    <div className="space-y-4 pt-4">
      <div className="flex items-center gap-2">
        <div className={tabsWrapperClass}>
          <button
            onClick={() => setActiveTab("conversations")}
            className={cn(
              "btn-tab flex-1",
            activeTab === "conversations" ?
              "btn-tab--active shadow-sm"  : "btn-tab--inactive",
          )}
          aria-pressed={activeTab === "conversations"}
        >
          Conversations
        </button>
        <button
          onClick={() => setActiveTab("contacts")}
          className={cn(
            "btn-tab flex-1",
            activeTab === "contacts" ? 
            "btn-tab--active shadow-sm"  : "btn-tab--inactive",
          )}
          aria-pressed={activeTab === "contacts"}
        >
          Contacts
        </button>
        </div>
      </div>

      <div className={activeTab === "conversations" ? "block" : "hidden"}>
        {conversations}
      </div>
      <div className={activeTab === "contacts" ? "block" : "hidden"}>
        {contacts}
      </div>
    </div>
  );
}
