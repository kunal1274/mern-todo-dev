import { FiX, FiCheckCircle } from "react-icons/fi";
import * as svc from "../../api/salesOrderService.js";
import { useState } from "react";

const STEPS1 = [
  { key: "approve", label: "Approve" },
  { key: "confirm", label: "Confirm" },
  { key: "ship", label: "Ship" },
  { key: "deliver", label: "Deliver" },
  { key: "invoice", label: "Invoice" },
  { key: "cancel", label: "Cancel" },
  { key: "draft", label: "Draft" },
  { key: "admin", label: "Admin Mode" },
  { key: "any", label: "Any Mode" },
];
const STEPS = [
  { key: "approve", label: "Approve", status: "Approved" },
  { key: "confirm", label: "Confirm", status: "Confirmed" },
  { key: "ship", label: "Ship", status: "Shipped" },
  { key: "deliver", label: "Deliver", status: "Delivered" },
  { key: "invoice", label: "Invoice", status: "Invoiced" },
  { key: "cancel", label: "Cancel", status: "Cancelled" },
  { key: "draft", label: "Draft", status: "Draft" },
  { key: "admin", label: "Admin Mode", status: "AdminMode" },
  { key: "any", label: "Any Mode", status: "AnyMode" },
];

export default function ProcessFlowDrawerCrystal({
  open,
  so,
  onClose,
  onDone,
}) {
  const [busy, setBusy] = useState(null);

  if (!open) return null;

  const trigger = async (key) => {
    setBusy(key);
    //await svc.patch(`/sales-orders/${so._id}/actions/${key}`);
    await svc.triggerSOAction(so._id, key);
    setBusy(null);
    onDone();
  };

  return (
    <aside className="fixed right-0 top-0 z-40 h-full w-96 bg-white shadow-lg">
      <div className="flex items-center justify-between border-b p-4">
        <h3 className="text-lg font-semibold">Process Flow – {so.orderNum}</h3>
        <button onClick={onClose}>
          <FiX className="text-xl" />
        </button>
      </div>

      <ol className="m-6 space-y-4">
        {STEPS.map((s) => (
          <li key={s.key} className="flex items-center gap-3">
            <span
              className={`inline-flex h-6 w-6 items-center justify-center rounded-full border ${
                so.status === s.status ? "border-brand-600" : "border-gray-300"
              }`}
            >
              {so.status === s.status && <FiCheckCircle />}
            </span>
            <span className="flex-1">{s.label}</span>
            <button
              disabled={busy || so.status === s.status}
              onClick={() => trigger(s.key)}
              className="rounded bg-brand-600 px-3 py-1 text-xs text-white disabled:bg-gray-300"
            >
              {busy === s.key ? "..." : "Set"}
            </button>
          </li>
        ))}
        <div className="mt-6 border-t pt-4 text-right">
          <a
            href={`${import.meta.env.VITE_API_URL}/sales-orders/${
              so._id
            }/print/invoice`}
            target="_blank"
            className="rounded border px-3 py-1 text-sm hover:bg-gray-50"
          >
            Print Invoice
          </a>
          <a
            href={`${import.meta.env.VITE_API_URL}/sales-orders/${
              so._id
            }/print/delivery`}
            target="_blank"
            className="ml-2 rounded border px-3 py-1 text-sm hover:bg-gray-50"
          >
            Print Delivery
          </a>
        </div>
      </ol>
    </aside>
  );
}
