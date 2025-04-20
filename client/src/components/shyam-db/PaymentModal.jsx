import { useState } from "react";
import { FiX } from "react-icons/fi";
import dayjs from "dayjs";

export default function PaymentModal({ open, onClose, onSubmit, currency }) {
  const [p, setP] = useState({
    amount: "",
    mode: "Cash",
    date: dayjs().format("YYYY-MM-DD"),
    ref: "",
  });
  if (!open) return null;
  const valid = p.amount > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-lg bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-lg font-medium">Add Payment</h4>
          <button onClick={onClose}>
            <FiX className="text-xl" />
          </button>
        </div>

        <label className="mb-1 block text-sm font-medium">Amount</label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={p.amount}
          onChange={(e) => setP({ ...p, amount: e.target.value })}
          className="mb-4 w-full rounded border px-3 py-2"
        />

        <label className="mb-1 block text-sm font-medium">Mode</label>
        <select
          className="mb-4 w-full rounded border px-3 py-2"
          value={p.mode}
          onChange={(e) => setP({ ...p, mode: e.target.value })}
        >
          {["Cash", "CreditCard", "DebitCard", "Online", "UPI", "Crypto"].map(
            (v) => (
              <option key={v}>{v}</option>
            )
          )}
        </select>

        <label className="mb-1 block text-sm font-medium">Reference ID</label>
        <input
          className="mb-4 w-full rounded border px-3 py-2"
          value={p.ref}
          onChange={(e) => setP({ ...p, ref: e.target.value })}
        />

        <label className="mb-1 block text-sm font-medium">Date</label>
        <input
          type="date"
          className="mb-6 w-full rounded border px-3 py-2"
          value={p.date}
          onChange={(e) => setP({ ...p, date: e.target.value })}
        />

        <div className="text-right">
          <button
            disabled={!valid}
            onClick={() => onSubmit(p)}
            className={`rounded px-4 py-2 text-sm text-white ${
              valid ? "bg-brand-600 hover:bg-brand-500" : "bg-gray-300"
            }`}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
