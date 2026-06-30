import { useState, useRef, useEffect } from "react";
import { safeFetch } from "../lib/fetch";

const DEFAULT_API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const SUGGESTIONS = [
  "Jelaskan skor hasil discovery-ku",
  "Aku bingung pilih karir setelah SMA",
  "Skill apa yang harus kupelajari untuk data analyst?",
  "Aku suka desain dan teknologi, cocoknya ke mana?",
  "Buatkan eksperimen 7 hari untuk UI/UX",
  "Gimana cara pindah karir dari marketing ke IT?",
  "Apa prospek karir frontend developer di Indonesia?",
  "Apa langkah pertama yang harus aku lakukan?",
];

export default function ChatBot({ token, user, api }: { token?: string; user?: unknown; api?: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([
    { role: "bot", text: "👋 Halo! Aku asisten karir Life Compass. Aku udah baca hasil discovery-mu, jadi aku bisa kasih saran yang lebih personal. Tanya apa aja soal karir, jurusan, skill, atau hasil skor kamu! 😊" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text?: string) => {
    const q = (text || input).trim();
    if (!q || !token) return;
    if (input !== q) setInput("");
    setError("");
    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setLoading(true);

    // Add an empty bot message that will be filled via streaming
    setMessages((prev) => [...prev, { role: "bot", text: "" }]);

    const baseApi = api || DEFAULT_API;
    try {
      const response = await fetch(`${baseApi}/api/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ question: q }),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            fullText += data;
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = { role: "bot", text: fullText };
              return updated;
            });
          }
        }
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "bot",
          text: "Terjadi kendala saat memproses permintaanmu. Coba ulangi beberapa saat lagi atau sederhanakan pertanyaanmu.",
        };
        return updated;
      });
    }
    setLoading(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-ink text-white rounded-full shadow-lg flex items-center justify-center text-2xl hover:shadow-xl hover:scale-105 active:scale-95 transition-all z-50 border-2 border-ink"
        aria-label="Buka asisten"
      >
        {open ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 w-80 sm:w-96 bg-card border-2 border-ink rounded-2xl shadow-xl z-50 flex flex-col max-h-[500px] animate-in slide-in-from-bottom-4 animate-duration-200">
          <div className="bg-ink text-white px-4 py-3 rounded-t-[14px] font-semibold text-sm flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Tanya Life Compass
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-72">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`text-sm p-3 rounded-xl max-w-[85%] leading-relaxed ${
                  m.role === "user"
                    ? "bg-ink text-white ml-auto"
                    : "bg-warm text-ink border border-ink/10"
                }`}
              >
                {m.text}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-sm text-ink/40">
                <span className="w-2 h-2 bg-ink/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-ink/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-ink/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            )}
            {error && (
              <div className="text-xs text-primary-500 text-center py-1">{error}</div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {messages.length <= 1 && !loading && (
            <div className="px-3 pb-2">
              <p className="text-xs text-ink/40 mb-2">Coba tanyakan:</p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => send(s)}
                    className="text-xs bg-warm border border-ink/20 rounded-full px-3 py-1.5 text-ink/70 hover:bg-ink hover:text-white hover:border-ink transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="border-t-2 border-ink/10 p-3 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Tanya sesuatu..."
              className="flex-1 border-2 border-ink/20 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-ink focus:ring-0 bg-warm"
            />
            <button
              onClick={() => send()}
              disabled={loading || !input.trim()}
              className="bg-ink text-white px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40 disabled:pointer-events-none hover:shadow-md transition-all active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
