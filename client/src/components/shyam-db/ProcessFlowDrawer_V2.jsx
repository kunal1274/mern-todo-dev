import { FiX, FiCheckCircle } from "react-icons/fi";
import { triggerSOAction } from "../../api/salesOrderService.js";
import { useState } from "react";
import { toast } from "react-toastify";

/* server‑side STATUS_TRANSITIONS mirrored locally
   (keep in sync if you change on the back‑end) */
const ALLOWED = {
  Draft: ["Approved", "Cancelled", "AdminMode", "AnyMode"],
  Approved: ["Confirmed", "Cancelled", "AdminMode", "AnyMode"],
  Confirmed: ["Shipped", "Cancelled", "AdminMode", "AnyMode"],
  Shipped: ["Delivered", "Cancelled", "AdminMode", "AnyMode"],
  Delivered: ["Invoiced", "AdminMode", "AnyMode"],
  Invoiced: ["AdminMode", "AnyMode"],
  Cancelled: ["AdminMode", "AnyMode"],
  AdminMode: ["Draft", "AnyMode"],
  AnyMode: [
    "Draft",
    "Approved",
    "Confirmed",
    "Shipped",
    "Delivered",
    "Invoiced",
    "Cancelled",
    "AdminMode",
  ],
};

/* steps in desired order */
const STEPS1 = [
  { key: "draft", status: "Draft" },
  { key: "approve", status: "Approved" },
  { key: "confirm", status: "Confirmed" },
  { key: "ship", status: "Shipped" },
  { key: "deliver", status: "Delivered" },
  { key: "invoice", status: "Invoiced" },
  { key: "cancel", status: "Cancelled" },
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

export default function ProcessFlowDrawer({ open, so, onClose, onDone }) {
  const [busy, setBusy] = useState(null);
  if (!open || !so) return null;

  /* is transition allowed from current status? */
  const canGo = (nextStatus) => ALLOWED[so.status]?.includes(nextStatus);

  const run = async (step) => {
    if (!canGo(step.status)) {
      toast.error(`Cannot move ${so.status} → ${step.status}`);
      return;
    }
    setBusy(step.key);
    try {
      await triggerSOAction(so._id, step.key);
      toast.success(`Status set to ${step.status}`);
      onDone();
    } catch (e) {
      toast.error(e.response?.data?.error || "Error");
    } finally {
      setBusy(null);
    }
  };

  return (
    <aside className="fixed right-0 top-0 z-40 h-full w-96 bg-white shadow-lg overflow-y-auto">
      <div className="flex items-center justify-between border-b p-4">
        <h3 className="text-lg font-semibold">Process Flow — {so.orderNum}</h3>
        <button onClick={onClose}>
          <FiX className="text-xl" />
        </button>
      </div>

      {/* vertical stepper */}
      <div className="relative m-8">
        {/* vertical line */}
        <div className="absolute left-3 top-4 h-[calc(100%-2rem)] w-px bg-gray-200" />
        <ol className="space-y-6">
          {STEPS.map((step) => {
            const done =
              STEPS.findIndex((s) => s.status === so.status) >
              STEPS.findIndex((s) => s.status === step.status);
            const active = so.status === step.status;
            const allowed = canGo(step.status);

            return (
              <li key={step.key} className="flex items-start gap-4">
                {/* node */}
                <span
                  className={`mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full border
                    ${
                      active
                        ? "border-brand-600 bg-brand-50"
                        : done
                        ? "border-brand-600 bg-brand-600 text-white"
                        : "border-gray-300"
                    }`}
                >
                  {done && <FiCheckCircle className="text-xs" />}
                </span>

                {/* label & button */}
                <div className="flex-1">
                  <div className={`text-sm ${active ? "font-semibold" : ""}`}>
                    {step.label}
                  </div>
                  <button
                    disabled={!allowed || active || busy}
                    onClick={() => run(step)}
                    className={`mt-1 rounded px-3 py-1 text-xs
                      ${
                        active
                          ? "bg-gray-300 text-white"
                          : allowed
                          ? "bg-brand-600 text-white hover:bg-brand-500"
                          : "bg-gray-100 text-gray-400"
                      }`}
                  >
                    {busy === step.key ? "..." : "Set"}
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {/* print links */}
      <div className="border-t px-6 py-4 text-right">
        <a
          href={`${import.meta.env.VITE_API_URL}/sales-orders/${
            so._id
          }/print/invoice`}
          target="_blank"
          className="rounded border px-3 py-1 text-sm hover:bg-gray-50"
        >
          Print Invoice
        </a>
        <a
          href={`${import.meta.env.VITE_API_URL}/sales-orders/${
            so._id
          }/print/delivery`}
          target="_blank"
          className="ml-2 rounded border px-3 py-1 text-sm hover:bg-gray-50"
        >
          Print Delivery
        </a>
      </div>
    </aside>
  );
}
