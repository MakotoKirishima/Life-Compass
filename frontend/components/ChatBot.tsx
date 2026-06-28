import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ChatBot({ token }: { token?: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([
    { role: "bot", text: "Halo! Ada yang bisa saya bantu seputar Life Compass?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim() || !token) return;
    const q = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/chat/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "bot", text: data.answer }]);
    } catch {
      setMessages((prev) => [...prev, { role: "bot", text: "Maaf, terjadi kesalahan." }]);
    }
    setLoading(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-blue-700 transition z-50"
      >
        {open ? "✕" : "💬"}
      </button>
      {open && (
        <div className="fixed bottom-24 right-6 w-80 bg-white rounded-2xl shadow-xl border z-50 flex flex-col max-h-96">
          <div className="bg-blue-600 text-white px-4 py-3 rounded-t-2xl font-medium text-sm">Tanya Life Compass</div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-64">
            {messages.map((m, i) => (
              <div key={i} className={`text-sm p-2 rounded-xl max-w-[80%] ${m.role === "user" ? "bg-blue-100 ml-auto" : "bg-gray-100"}`}>
                {m.text}
              </div>
            ))}
            {loading && <div className="text-sm text-gray-400">Mengetik...</div>}
          </div>
          <div className="border-t p-2 flex gap-2">
            <input
              value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Tanya sesuatu..."
              className="flex-1 border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button onClick={send} disabled={loading || !input.trim()} className="bg-blue-600 text-white px-3 py-2 rounded-xl text-sm disabled:opacity-50">Kirim</button>
          </div>
        </div>
      )}
    </>
  );
}
