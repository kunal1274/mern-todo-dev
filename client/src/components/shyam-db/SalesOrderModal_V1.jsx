import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";

export default function SalesOrderModal({
  open,
  onClose,
  onSubmit,
  initial = {},
}) {
  const [form, setForm] = useState(initial);

  useEffect(() => setForm(initial), [initial]);

  const handle = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-2xl rounded-lg bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {form._id ? "Edit Sales Order" : "New Sales Order"}
          </h3>
          <button onClick={onClose}>
            <FiX className="text-xl" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* only a few fields for now; extend later  */}
          <div>
            <label className="block text-sm font-medium">Order Type</label>
            <select
              name="orderType"
              value={form.orderType || "Sales"}
              onChange={handle}
              className="mt-1 w-full rounded border px-2 py-1"
            >
              <option value="Sales">Sales</option>
              <option value="Return">Return</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Customer ID</label>
            <input
              name="customer"
              value={form.customer || ""}
              onChange={handle}
              className="mt-1 w-full rounded border px-2 py-1"
              placeholder="ObjectId"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Item ID</label>
            <input
              name="item"
              value={form.item || ""}
              onChange={handle}
              className="mt-1 w-full rounded border px-2 py-1"
              placeholder="ObjectId"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Quantity</label>
            <input
              name="quantity"
              type="number"
              step="0.01"
              value={form.quantity || 1}
              onChange={handle}
              className="mt-1 w-full rounded border px-2 py-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Price</label>
            <input
              name="price"
              type="number"
              step="0.01"
              value={form.price || 0}
              onChange={handle}
              className="mt-1 w-full rounded border px-2 py-1"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded border px-4 py-2 text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(form)}
            className="rounded bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600/90"
          >
            {form._id ? "Save" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
