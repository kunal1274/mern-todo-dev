import { useState } from "react";
import { FiX } from "react-icons/fi";

export default function QuantityModal({ open, onClose, onSubmit, max }) {
  const [qty, setQty] = useState("");
  if (!open) return null;

  const valid = qty > 0 && qty <= max;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-lg bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-lg font-medium">Enter Quantity</h4>
          <button onClick={onClose}>
            <FiX className="text-xl" />
          </button>
        </div>

        <p className="mb-2 text-sm text-gray-600">
          Ordered&nbsp;qty: <strong>{max}</strong>
        </p>
        <input
          type="number"
          step="0.01"
          min="0"
          max={max}
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          className="w-full rounded border px-3 py-2"
        />

        <div className="mt-6 text-right">
          <button
            disabled={!valid}
            onClick={() => onSubmit(Number(qty))}
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
