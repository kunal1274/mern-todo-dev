import { askAI } from "../../api/ai";
import { FiX } from "react-icons/fi";
import { useState } from "react";

const PROMPTS = [
  "Summarize this order",
  "Suggest pricing optimisation",
  "Highlight shipment bottlenecks",
  "Predict AR overdue risk",
];

export default function PromptDrawer({ open, orderJson, onClose }) {
  const [busy, setBusy] = useState(false);
  const [answer, setAnswer] = useState("");

  async function fire(p) {
    setBusy(true);
    setAnswer("");
    const q = `${p}. Order JSON:\n${JSON.stringify(orderJson)}`;
    setAnswer(await askAI(q));
    setBusy(false);
  }

  if (!open) return null;
  return (
    <aside className="fixed right-0 top-0 z-[50] h-full w-80 bg-white shadow-lg overflow-y-auto">
      <div className="flex items-center justify-between border-b px-4 py-2 sticky top-0 z-20 bg-white/95">
        <b>AI Prompts</b>
        <button onClick={onClose}>
          <FiX />
        </button>
      </div>
      <div className="p-4 space-y-2 text-sm overflow-auto">
        {PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => fire(p)}
            className="block w-full rounded border px-3 py-1 text-left hover:bg-gray-50"
          >
            {p}
          </button>
        ))}
        {busy && (
          <p className="mt-4 text-xs text-gray-500 animate-pulse">
            💭 Thinking… ℹ️ AI can make mistakes. Check important info.
          </p>
        )}

        {!!answer && <pre className="whitespace-pre-wrap">{answer}</pre>}
      </div>
    </aside>
  );
}
