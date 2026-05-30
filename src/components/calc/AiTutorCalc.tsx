import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Send, Trash2, Loader2, Bot, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useT } from "@/lib/i18n";

export function AiTutorCalc() {
  const { t } = useT();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { messages, sendMessage, status, setMessages, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  useEffect(() => {
    if (!isLoading) inputRef.current?.focus();
  }, [isLoading]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isLoading) return;
    sendMessage({ text });
    setInput("");
  };

  const suggestions = [
    "Explain the quadratic formula",
    "How do I find the derivative of x²?",
    "What is Pythagoras theorem?",
    "Solve: 2x + 5 = 15",
  ];

  return (
    <div className="rounded-2xl glass shadow-elegant overflow-hidden flex flex-col h-[70vh]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
            <Bot className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="text-sm font-medium">Calcverse Tutor</div>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setMessages([])}>
            <Trash2 className="h-4 w-4 mr-1" /> {t("clear_chat")}
          </Button>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8 space-y-4">
            <div className="mx-auto h-14 w-14 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
              <Bot className="h-7 w-7 text-primary-foreground" />
            </div>
            <p className="text-muted-foreground">{t("tutor_empty")}</p>
            <div className="flex flex-wrap gap-2 justify-center max-w-xl mx-auto">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage({ text: s })}
                  className="text-xs rounded-full border border-border bg-card hover:bg-accent px-3 py-1.5 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => {
          const text = m.parts
            .map((p) => (p.type === "text" ? p.text : ""))
            .join("");
          const isUser = m.role === "user";
          return (
            <div key={m.id} className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
              <div
                className={`h-8 w-8 shrink-0 rounded-lg flex items-center justify-center ${
                  isUser ? "bg-primary text-primary-foreground" : "gradient-primary text-primary-foreground"
                }`}
              >
                {isUser ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                  isUser
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                {text}
              </div>
            </div>
          );
        })}

        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="bg-muted rounded-2xl px-4 py-2.5 text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> {t("thinking")}
            </div>
          </div>
        )}

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 rounded-lg p-3">
            {error.message || "Something went wrong. Please try again."}
          </div>
        )}
      </div>

      <div className="border-t border-border p-3 flex gap-2 items-end">
        <Textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={t("tutor_placeholder")}
          className="flex-1 min-h-[44px] max-h-32 resize-none"
          disabled={isLoading}
        />
        <Button onClick={handleSend} disabled={!input.trim() || isLoading} size="icon" className="h-11 w-11 shrink-0">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
