import { formatDaySeparator, formatTime } from "@/lib/utils";

type Message = {
  id: string;
  sender_id: string | null;
  content: string | null;
  created_at: string | null;
};

type MessageGroup = {
  key: string;
  label: string;
  items: Message[];
};

export default function MessageList({
  messages,
  viewerId,
}: {
  messages: Message[];
  viewerId: string;
}) {
  const groups = groupMessagesByDay(messages);

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.key} className="space-y-2">
          <div className="flex justify-center">
            <span className="rounded-full border bg-white px-3 py-1 text-xs text-slate-500">
              {group.label}
            </span>
          </div>

          {group.items.map((message) => {
            const isMine = message.sender_id === viewerId;

            return (
              <div
                key={message.id}
                className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                  isMine ? "ml-auto bg-black text-white" : "bg-slate-100"
                }`}
              >
                <div>{message.content ?? ""}</div>
                <div className="mt-1 text-xs opacity-70">
                  {formatTime(message.created_at)}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function groupMessagesByDay(messages: Message[]): MessageGroup[] {
  const groups: MessageGroup[] = [];

  for (const message of messages) {
    const key = getDayKey(message.created_at);
    const lastGroup = groups[groups.length - 1];

    if (!lastGroup || lastGroup.key !== key) {
      groups.push({
        key,
        label: formatDaySeparator(message.created_at),
        items: [message],
      });
    } else {
      lastGroup.items.push(message);
    }
  }

  return groups;
}

function getDayKey(value: string | null) {
  if (!value) return "unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "unknown";
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}
