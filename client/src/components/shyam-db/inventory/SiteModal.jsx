import { Dialog } from "@headlessui/react";
import { FiX } from "react-icons/fi";
import { useState, useEffect } from "react";

const EMPTY = { name: "", description: "", type: "Physical", active: true };

export default function SiteModal({ open, initial = {}, onClose, onSubmit }) {
  const [form, setForm] = useState({ ...EMPTY, ...initial });
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (open) setForm({ ...EMPTY, ...initial });
  }, [open, initial]);

  const ok = !!form.name;

  return (
    <Dialog open={open} onClose={onClose} className="relative z-[60]">
      <div className="fixed inset-0 bg-black/40" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-lg rounded bg-white shadow">
          {/* header */}
          <div className="flex items-center justify-between border-b px-6 py-4">
            <Dialog.Title className="text-lg font-semibold">
              {initial._id ? "Edit Site" : "New Site"}
            </Dialog.Title>
            <button onClick={onClose}>
              <FiX className="text-xl" />
            </button>
          </div>

          {/* body */}
          <div className="space-y-4 p-6">
            <label className="text-sm block">
              Name *
              <input
                className="mt-1 w-full rounded border px-3 py-2"
                value={form.name}
                onChange={(e) => set("name")(e.target.value)}
              />
            </label>

            <label className="text-sm block">
              Description
              <textarea
                rows={2}
                className="mt-1 w-full rounded border px-3 py-2"
                value={form.description}
                onChange={(e) => set("description")(e.target.value)}
              />
            </label>

            <label className="text-sm block">
              Type
              <select
                className="mt-1 w-full rounded border px-3 py-2"
                value={form.type}
                onChange={(e) => set("type")(e.target.value)}
              >
                <option>Physical</option>
                <option>Virtual</option>
              </select>
            </label>

            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => set("active")(e.target.checked)}
              />
              Active
            </label>
          </div>

          {/* footer */}
          <div className="border-t px-6 py-4 text-right">
            <button
              disabled={!ok}
              onClick={() => onSubmit(form)}
              className={`rounded px-4 py-2 text-white ${
                ok ? "bg-brand-600 hover:bg-brand-500" : "bg-gray-300"
              }`}
            >
              {initial._id ? "Save" : "Create"}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
