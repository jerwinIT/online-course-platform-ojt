"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

type SimpleMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

function getMessageText(parts: Array<{ type: string; text?: string }>): string {
  return (parts ?? [])
    .filter(
      (p): p is { type: "text"; text: string } =>
        p.type === "text" && "text" in p,
    )
    .map((p) => p.text)
    .join("");
}

const NO_PROVIDER_MESSAGE = "No AI provider configured";

function isQuotaOrConfigError(message: string | undefined): boolean {
  if (!message) return false;
  const lower = message.toLowerCase();
  return (
    message.includes(NO_PROVIDER_MESSAGE) ||
    lower.includes("quota") ||
    lower.includes("billing") ||
    lower.includes("exceeded") ||
    lower.includes("rate limit")
  );
}

export function LandingChat() {
  const [open, setOpen] = useState(false);
  const [simpleMode, setSimpleMode] = useState(false);
  const [simpleMessages, setSimpleMessages] = useState<SimpleMessage[]>([]);
  const [faqLoading, setFaqLoading] = useState(false);
  const scrollAnchorRef = useRef<HTMLDivElement>(null);
  const { messages, sendMessage, status, error, clearError } = useChat();

  const showSimpleAssistantOption =
    error && error.message && isQuotaOrConfigError(error.message);

  useEffect(() => {
    if (!open) return;
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [open, messages, simpleMessages]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.querySelector<HTMLInputElement>(
      'input[name="chat-input"]',
    );
    const value = input?.value?.trim();
    if (!value) return;

    if (simpleMode) {
      const userMsg: SimpleMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: value,
      };
      setSimpleMessages((prev) => [...prev, userMsg]);
      if (input) input.value = "";
      setFaqLoading(true);
      try {
        const res = await fetch("/api/chat-faq", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: value }),
        });
        const data = await res.json();
        const reply =
          typeof data?.reply === "string"
            ? data.reply
            : "I can help with courses, enrollment, and your dashboard. Try asking something specific about LearnHub.";
        setSimpleMessages((prev) => [
          ...prev,
          { id: `asst-${Date.now()}`, role: "assistant", content: reply },
        ]);
      } catch {
        setSimpleMessages((prev) => [
          ...prev,
          {
            id: `asst-${Date.now()}`,
            role: "assistant",
            content: "Something went wrong. Please try again.",
          },
        ]);
      } finally {
        setFaqLoading(false);
      }
      return;
    }

    if (status === "streaming") return;
    sendMessage({ text: value });
    if (input) input.value = "";
  };

  const handleUseSimpleAssistant = () => {
    clearError();
    setSimpleMode(true);
  };

  const handleClose = () => {
    setOpen(false);
    clearError();
  };

  const isLoading = simpleMode
    ? faqLoading
    : status === "streaming" || status === "submitted";
  const hasError = Boolean(error) && !simpleMode;
  const errorMessage =
    hasError && error?.message
      ? error.message
      : "Chat is unavailable. Please try again later.";
  const displayMessages = simpleMode ? simpleMessages : messages;
  const showEmptyState = displayMessages.length === 0 && !hasError;

  return (
    <>
      <Button
        type="button"
        variant="default"
        size="icon"
        className="fixed bottom-6 right-6 z-50 size-14 rounded-full shadow-lg"
        aria-label="Open chat"
        onClick={() => setOpen(true)}
      >
        <MessageCircle className="size-7" />
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:p-6 lg:items-center lg:justify-center lg:p-0"
          aria-modal="true"
          role="dialog"
        >
          <div
            className="absolute inset-0 bg-black/40"
            onClick={handleClose}
            aria-hidden="true"
          />
          <div
            className={cn(
              "relative flex w-full max-w-md flex-col rounded-2xl border bg-card text-card-foreground shadow-xl",
              "h-[min(85vh,32rem)] lg:h-[28rem]",
            )}
          >
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex size-9 items-center justify-center rounded-full bg-primary/10">
                  <MessageCircle className="size-4 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold">LearnHub Assistant</h2>
                  <p className="text-xs text-muted-foreground">
                    Ask about courses, enrollment, and more
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Close chat"
                onClick={handleClose}
              >
                <X className="size-5" />
              </Button>
            </div>

            <ScrollArea className="flex-1 overflow-y-auto px-4 py-3">
              <div className="flex flex-col gap-4">
                {showEmptyState && (
                  <div className="rounded-lg border border-dashed bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                    <p className="font-medium">Hi! How can I help?</p>
                    <p className="mt-1">
                      Ask about courses, how to enroll, your dashboard, or
                      anything about LearnHub.
                    </p>
                  </div>
                )}
                {hasError && (
                  <div className="space-y-2">
                    <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                      {errorMessage}
                    </div>
                    {showSimpleAssistantOption && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="w-full"
                        onClick={handleUseSimpleAssistant}
                      >
                        Use simple assistant (no API key, no quota limits)
                      </Button>
                    )}
                  </div>
                )}
                {simpleMode &&
                  simpleMessages.map((message) => {
                    const isUser = message.role === "user";
                    return (
                      <div
                        key={message.id}
                        className={cn(
                          "flex",
                          isUser ? "justify-end" : "justify-start",
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                            isUser
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted",
                            !isUser &&
                              "prose prose-sm dark:prose-invert max-w-none prose-p:my-0.5 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-headings:my-1",
                          )}
                        >
                          {isUser ? (
                            <span className="whitespace-pre-wrap">
                              {message.content}
                            </span>
                          ) : (
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                          )}
                        </div>
                      </div>
                    );
                  })}
                {!simpleMode &&
                  messages.map((message) => {
                    const text = getMessageText(message.parts ?? []);
                    if (!text) return null;
                    const isUser = message.role === "user";
                    return (
                      <div
                        key={message.id}
                        className={cn(
                          "flex",
                          isUser ? "justify-end" : "justify-start",
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                            isUser
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted",
                            !isUser &&
                              "prose prose-sm dark:prose-invert max-w-none prose-p:my-0.5 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-headings:my-1",
                          )}
                        >
                          {isUser ? (
                            <span className="whitespace-pre-wrap">{text}</span>
                          ) : (
                            <ReactMarkdown>{text}</ReactMarkdown>
                          )}
                        </div>
                      </div>
                    );
                  })}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-2.5">
                      <Loader2 className="size-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">
                        Thinking...
                      </span>
                    </div>
                  </div>
                )}
                <div ref={scrollAnchorRef} aria-hidden="true" />
              </div>
            </ScrollArea>

            <form onSubmit={handleSubmit} className="flex gap-2 border-t p-3">
              <Input
                name="chat-input"
                placeholder="Ask about LearnHub..."
                className="min-w-0 flex-1"
                disabled={isLoading}
                autoComplete="off"
              />
              <Button
                type="submit"
                size="icon"
                disabled={isLoading}
                aria-label="Send message"
              >
                {isLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
