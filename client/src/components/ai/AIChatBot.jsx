import { useState } from "react";
import { askAI, chatAboutOrder } from "../../api/ai.js";
import { FiSend, FiX } from "react-icons/fi";

export default function ChatBot({ initialPrompt, orderNum }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [log, setLog] = useState([]);

  async function send() {
    if (!q.trim()) return;
    const me = { role: "user", text: q };
    setLog((l) => [...l, me]);
    setQ("");
    // const aiText = await askAI(q);
    const aiRes = await chatAboutOrder(q, orderNum);
    setLog((l) => [...l, me, { role: "ai", text: aiRes }]);
  }

  return (
    <>
      {/* FAB */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="z-10 fixed bottom-6 right-6 rounded-full bg-brand-600 p-4 shadow-xl animate-pulse"
        >
          💬
        </button>
      )}

      {/* PANEL */}
      {open && (
        <div className="fixed bottom-4 right-4 z-[90] flex h-96 w-80 flex-col rounded-lg bg-white shadow-xl">
          <div className="flex items-center justify-between border-b px-3 py-2">
            <span className="font-medium">AI Assistant</span>
            <button onClick={() => setOpen(false)}>
              <FiX />
            </button>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto p-3 text-sm">
            {!log.length && <p className="text-gray-400">{initialPrompt}</p>}
            {log.map((m, i) => (
              <div key={i} className={m.role === "user" ? "text-right" : ""}>
                <span
                  className={`inline-block rounded px-2 py-1 ${
                    m.role === "user"
                      ? "bg-brand-600 text-white"
                      : "bg-gray-100"
                  }`}
                >
                  {m.text}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t p-2">
            <div className="flex items-center gap-2">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                className="flex-1 rounded border px-2 py-1 text-sm"
              />
              <button
                onClick={send}
                className="rounded bg-brand-600 p-2 text-white"
              >
                <FiSend />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
