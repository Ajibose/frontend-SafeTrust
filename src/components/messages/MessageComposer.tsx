"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type MessageComposerProps = {
  conversationId: string;
  senderId: string;
  apartmentId: string;
};

export function MessageComposer({ conversationId }: MessageComposerProps) {
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!body.trim()) return;
    setIsSending(true);

    await new Promise((resolve) => setTimeout(resolve, 400));
    toast.success("Message sent! (skeleton mode)");

    setBody("");
    setIsSending(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className="p-4 border-t mt-auto flex gap-3 items-end bg-background"
      data-conversation-id={conversationId}
    >
      <Textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        className="min-h-[60px] max-h-[120px] resize-none"
        disabled={isSending}
      />
      <Button
        size="icon"
        onClick={handleSend}
        disabled={!body.trim() || isSending}
        className="h-10 w-10 shrink-0"
      >
        <Send className="h-4 w-4" />
        <span className="sr-only">Send</span>
      </Button>
    </div>
  );
}
