import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import dayjs from "dayjs";

export default function MovementModal({
  open,
  onClose,
  onSubmit,
  max,
  title,
  totals /* ← { ordered, shipped, delivered, invoiced } */,
}) {
  const blank = {
    qty: "",
    mode: title === "Invoice" ? "Net30D" : "Road",
    ref: "",
    date: dayjs().format("YYYY-MM-DD"),
  };
  const [form, setForm] = useState(blank);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => setForm(blank), [open]); // reset every open
  if (!open) return null;

  const valid = form.qty > 0 && form.qty <= max;

  const field =
    title === "Ship"
      ? "Shipment Mode"
      : title === "Deliver"
      ? "Delivery Mode"
      : "Payment Terms";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-lg bg-white p-6">
        {/* header */}
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-lg font-medium">
            {title} – remaining <span className="font-bold">{max}</span>
          </h4>
          <button onClick={onClose}>
            <FiX className="text-xl" />
          </button>
        </div>

        {/* mini badges */}
        <p className="mb-4 text-xs text-gray-500">
          Ordered {totals.ordered} · Shipped {totals.shipped} · Delivered 
          {totals.delivered} · Invoiced {totals.invoiced}
        </p>

        {/* qty */}
        <label className="mb-1 block text-sm font-medium">Quantity</label>
        <input
          type="number"
          step="0.01"
          min="0"
          max={max}
          value={form.qty}
          onChange={(e) => setForm({ ...form, qty: e.target.value })}
          className="mb-4 w-full rounded border px-3 py-2"
        />

        <button
          onClick={() => setShowMore((s) => !s)}
          className="mb-4 text-xs text-brand-600 underline"
        >
          {showMore ? "Hide fields" : "More fields"}
        </button>

        {showMore && (
          <>
            <label className="mb-1 block text-sm font-medium">{field}</label>
            {title === "Invoice" ? (
              <select
                className="mb-4 w-full rounded border px-3 py-2"
                value={form.mode}
                onChange={(e) => setForm({ ...form, mode: e.target.value })}
              >
                {[
                  "COD",
                  "Net7D",
                  "Net15D",
                  "Net30D",
                  "Net45D",
                  "Net60D",
                  "Net90D",
                  "Advance",
                ].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            ) : (
              <select
                className="mb-4 w-full rounded border px-3 py-2"
                value={form.mode}
                onChange={(e) => setForm({ ...form, mode: e.target.value })}
              >
                {["Air", "Road", "Sea"].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            )}

            <label className="mb-1 block text-sm font-medium">
              Reference ID
            </label>
            <input
              className="mb-4 w-full rounded border px-3 py-2"
              value={form.ref}
              onChange={(e) => setForm({ ...form, ref: e.target.value })}
            />

            <label className="mb-1 block text-sm font-medium">Date</label>
            <input
              type="date"
              className="mb-6 w-full rounded border px-3 py-2"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </>
        )}

        <div className="text-right">
          <button
            disabled={!valid}
            onClick={() => onSubmit(form)}
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
