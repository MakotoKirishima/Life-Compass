import { useState, useRef, useEffect } from "react";
import { safeFetch } from "../lib/fetch";

const DEFAULT_API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const SUGGESTIONS = [
  "Aku bingung pilih karir setelah SMA",
  "Skill apa yang harus kupelajari untuk data analyst?",
  "Aku suka desain dan teknologi, cocoknya ke mana?",
  "Buatkan eksperimen 7 hari untuk mencoba UI/UX design",
];

export default function ChatBot({ token, user, api }: { token?: string; user?: unknown; api?: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([
    { role: "bot", text: "Halo! Ada yang bisa saya bantu seputar karir dan Life Compass?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    const q = input.trim();
    if (!q || !token) return;
    setInput("");
    setError("");
    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setLoading(true);

    const baseApi = api || DEFAULT_API;
    try {
      const res = await safeFetch<{ answer: string }>("/api/chat/", {
          method: "POST",
        data: { question: q },
        token,
        baseUrl: baseApi,
      });

      if (res.ok && res.data?.answer) {
        setMessages((prev) => [...prev, { role: "bot", text: res.data!.answer }]);
      } else if (res.status === 401) {
        setMessages((prev) => [
          ...prev,
          { role: "bot", text: "Sesi kamu telah berakhir. Silakan login ulang untuk menggunakan asisten." },
        ]);
      } else if (res.error) {
        setMessages((prev) => [...prev, { role: "bot", text: `Maaf, ${res.error.toLowerCase()}` }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "bot", text: "Terjadi kendala saat memproses permintaanmu. Coba ulangi beberapa saat lagi." },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Terjadi kendala saat memproses permintaanmu. Coba ulangi beberapa saat lagi atau sederhanakan pertanyaanmu." },
      ]);
    }
    setLoading(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-500 text-white rounded-full shadow-lg flex items-center justify-center text-2xl hover:shadow-xl hover:scale-105 active:scale-95 transition-all z-50"
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
        <div className="fixed bottom-24 right-6 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border z-50 flex flex-col max-h-[500px] animate-in slide-in-from-bottom-4 duration-200">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-500 text-white px-4 py-3 rounded-t-2xl font-medium text-sm flex items-center gap-2">
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
                    ? "bg-blue-600 text-white ml-auto rounded-br-md"
                    : "bg-gray-100 text-gray-800 rounded-bl-md"
                }`}
              >
                {m.text}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            )}
            {error && (
              <div className="text-xs text-red-500 text-center py-1">{error}</div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {messages.length === 1 && !loading && (
            <div className="px-3 pb-2">
              <p className="text-xs text-gray-400 mb-2">Coba tanyakan:</p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInput(s);
                    }}
                    className="text-xs bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 text-gray-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="border-t p-3 flex gap-2">
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
              className="flex-1 border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="bg-gradient-to-r from-blue-600 to-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium disabled:opacity-40 disabled:pointer-events-none hover:shadow-md transition-all active:scale-95"
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
