import { useState } from "react";
import { FiX } from "react-icons/fi";
import dayjs from "dayjs";

export default function MovementModal({ open, onClose, onSubmit, max, title }) {
  const initial = {
    qty: "",
    mode: title === "Invoice" ? "Net30D" : "Road",
    ref: "",
    date: dayjs().format("YYYY-MM-DD"),
  };
  const [form, setForm] = useState(initial);
  const [showMore, setShowMore] = useState(false);

  if (!open) return null;
  const valid = form.qty > 0 && form.qty <= max;

  /* ---------------------------------- */
  const label =
    title === "Ship"
      ? "Shipment Mode"
      : title === "Deliver"
      ? "Delivery Mode"
      : "Payment Terms";

  const pickList =
    title === "Invoice"
      ? [
          "COD",
          "Net7D",
          "Net15D",
          "Net30D",
          "Net45D",
          "Net60D",
          "Net90D",
          "Advance",
        ]
      : ["Air", "Road", "Sea"];
  /* ---------------------------------- */

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-lg bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-lg font-medium">
            {title} – remaining <b>{max}</b>
          </h4>
          <button onClick={onClose}>
            <FiX className="text-xl" />
          </button>
        </div>

        {/* qty */}
        <label className="text-sm font-medium">Quantity</label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={form.qty}
          onChange={(e) => setForm({ ...form, qty: +e.target.value })}
          className="mt-1 mb-4 w-full rounded border px-3 py-2"
        />

        <button
          onClick={() => setShowMore((s) => !s)}
          className="mb-4 text-xs text-brand-600 underline"
        >
          {showMore ? "Hide fields" : "More fields"}
        </button>

        {showMore && (
          <>
            <label className="text-sm font-medium">{label}</label>
            <select
              className="mt-1 mb-4 w-full rounded border px-3 py-2"
              value={form.mode}
              onChange={(e) => setForm({ ...form, mode: e.target.value })}
            >
              {pickList.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>

            <label className="text-sm font-medium">Reference ID</label>
            <input
              className="mt-1 mb-4 w-full rounded border px-3 py-2"
              value={form.ref}
              onChange={(e) => setForm({ ...form, ref: e.target.value })}
            />

            <label className="text-sm font-medium">Date</label>
            <input
              type="date"
              className="mt-1 mb-6 w-full rounded border px-3 py-2"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </>
        )}

        <div className="text-right space-x-4">
          <button
            disabled={!valid}
            onClick={() => onSubmit(form)}
            className={`rounded px-4 py-2 text-white ${
              valid ? "bg-brand-500 hover:bg-brand-500" : "bg-gray-300"
            }`}
          >
            OK
          </button>
          <button
            disabled={!valid}
            onClick={() => onSubmit(form)}
            className={`rounded px-4 py-2 text-white ${
              valid ? "bg-brand-600 hover:bg-brand-500" : "bg-gray-300"
            }`}
          >
            OK & POST
          </button>
        </div>
      </div>
    </div>
  );
}
