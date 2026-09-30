"use client";

import dynamic from "next/dynamic";
import { MOCK_CONVERSATIONS, MOCK_CURRENT_USER } from "@/lib/mockData/messages";

const ConversationList = dynamic(
  () =>
    import("@/components/messages/ConversationList").then((m) => ({
      default: m.ConversationList,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col divide-y">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4">
            <div className="h-12 w-12 rounded-full bg-muted animate-pulse shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 rounded bg-muted animate-pulse" />
              <div className="h-3 w-48 rounded bg-muted animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    ),
  },
);

export default function MessagesPage() {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h1 className="text-xl font-semibold">Your Conversations</h1>
      </div>
      <ConversationList
        conversations={MOCK_CONVERSATIONS}
        currentUserId={MOCK_CURRENT_USER.uid}
      />
    </div>
  );
}
