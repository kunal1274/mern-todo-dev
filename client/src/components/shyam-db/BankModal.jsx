import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import { fetchBanks, addBank } from "../../api/salesOrderService";

export default function BankModal({ open, soId, onClose }) {
  const [banks, setBanks] = useState([]);
  const [form, setForm] = useState({ bank: "", acct: "", ifsc: "" });

  useEffect(() => {
    if (open) fetchBanks(soId).then((r) => setBanks(r.data || []));
  }, [open, soId]);

  if (!open) return null;

  const add = () =>
    addBank(soId, form).then(() => {
      setForm({ bank: "", acct: "", ifsc: "" });
      return fetchBanks(soId).then((r) => setBanks(r.data));
    });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-lg bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-lg font-medium">Banks</h4>
          <button onClick={onClose}>
            <FiX className="text-xl" />
          </button>
        </div>

        {/* form */}
        <div className="grid grid-cols-3 gap-3">
          <input
            placeholder="Bank"
            value={form.bank}
            onChange={(e) => setForm({ ...form, bank: e.target.value })}
            className="rounded border px-2 py-1 text-sm"
          />
          <input
            placeholder="Account #"
            value={form.acct}
            onChange={(e) => setForm({ ...form, acct: e.target.value })}
            className="rounded border px-2 py-1 text-sm"
          />
          <input
            placeholder="IFSC"
            value={form.ifsc}
            onChange={(e) => setForm({ ...form, ifsc: e.target.value })}
            className="rounded border px-2 py-1 text-sm"
          />
        </div>
        <button
          onClick={add}
          className="mt-3 rounded bg-brand-600 px-3 py-1 text-xs text-white hover:bg-brand-500"
        >
          Add
        </button>

        {/* history */}
        <div className="mt-6 max-h-56 overflow-y-auto">
          {banks.map((b) => (
            <div key={b._id} className="mb-2 rounded border p-2 text-xs">
              {b.bank} · {b.acct} · {b.ifsc}
            </div>
          ))}
          {!banks.length && (
            <p className="text-xs text-gray-500">No bank details.</p>
          )}
        </div>
      </div>
    </div>
  );
}
