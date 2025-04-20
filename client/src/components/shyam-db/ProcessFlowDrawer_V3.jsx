import { FiX, FiCheckCircle } from "react-icons/fi";
import {
  triggerSOAction,
  triggerSOActionWithData,
} from "../../api/salesOrderService.js";
import { useState } from "react";
import { toast } from "react-toastify";
import QuantityModal from "./QuantityModal.jsx";

/* ------------------------------------------------------------------
   1. status transition matrix (mirror back‑end)
------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------
   2. ordered list (visual order = process order)
------------------------------------------------------------------ */
const STEPS1 = [
  { key: "draft", status: "Draft" },
  { key: "approve", status: "Approved" },
  { key: "confirm", status: "Confirmed" },
  { key: "ship", status: "Shipped", needsQty: "shippingQty" },
  { key: "deliver", status: "Delivered", needsQty: "deliveringQty" },
  { key: "invoice", status: "Invoiced", needsQty: "invoicingQty" },
  { key: "cancel", status: "Cancelled" },
];

const STEPS = [
  { key: "approve", label: "Approve", status: "Approved" },
  { key: "confirm", label: "Confirm", status: "Confirmed" },
  { key: "ship", label: "Ship", status: "Shipped", needsQty: "shippingQty" },
  {
    key: "deliver",
    label: "Deliver",
    status: "Delivered",
    needsQty: "deliveringQty",
  },
  {
    key: "invoice",
    label: "Invoice",
    status: "Invoiced",
    needsQty: "invoicingQty",
  },
  { key: "cancel", label: "Cancel", status: "Cancelled" },
  { key: "draft", label: "Draft", status: "Draft" },
  { key: "admin", label: "Admin Mode", status: "AdminMode" },
  { key: "any", label: "Any Mode", status: "AnyMode" },
];

export default function ProcessFlowDrawer({ open, so, onClose, onDone }) {
  const [busy, setBusy] = useState(null);
  const [qtyPrompt, setQtyPrompt] = useState(null); // {step,max}
  if (!open || !so) return null;

  /* helpers */
  const idxCurrent = STEPS.findIndex((s) => s.status === so.status);
  const canGo = (nextStatus) => ALLOWED[so.status]?.includes(nextStatus);

  /* called after qty modal OR direct Set click ------------------- */
  const fireAction = async (step, extra = undefined) => {
    if (!canGo(step.status)) {
      toast.error(`❌ Cannot move ${so.status} → ${step.status}`);
      return;
    }
    setBusy(step.key);
    try {
      if (extra !== undefined) {
        await triggerSOActionWithData(so._id, step.key, extra);
      } else {
        await triggerSOAction(so._id, step.key);
      }
      toast.success(`✅ Status set to ${step.status}`);
      onDone();
    } catch (e) {
      toast.error(`❌ ${e.response?.data?.error}` || "❌ Error");
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      {/* ---------------- Drawer ---------------- */}
      <aside className="fixed right-0 top-0 z-40 h-full w-96 overflow-y-auto bg-white shadow-lg">
        <div className="flex items-center justify-between border-b p-4">
          {/* <h3 className="text-lg font-semibold">
            Process Flow — {so.orderNum}
          </h3> */}

          {/**I need that the customer name should show below the so order num and then also Qty and its unit of measurement */}
          <div>
            <h3 className="text-lg font-semibold">
              Process Flow - {so.orderNum}
            </h3>
            <p className="mt-0.5 text-xs text-gray-500">
              {so.customer.name} • {so.quantity} {so.item.unit} •{" "}
              {so.netAmtAfterTax.toFixed(2)} {so.currency}
            </p>
            <span
              className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] uppercase ${
                so.status === "Draft"
                  ? "bg-gray-100 text-gray-600"
                  : so.status === "Approved"
                  ? "bg-yellow-100 text-yellow-700"
                  : so.status === "Confirmed"
                  ? "bg-blue-100 text-blue-700"
                  : so.status === "Shipped"
                  ? "bg-emerald-100 text-emerald-700"
                  : so.status === "Delivered"
                  ? "bg-teal-100 text-teal-700"
                  : so.status === "Invoiced"
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {so.status}
            </span>
          </div>
          <button onClick={onClose}>
            <FiX className="text-xl" />
          </button>
        </div>

        {/* ------------- vertical stepper ------------- */}
        <div className="relative m-8">
          <div className="absolute left-3 top-4 h-[calc(100%-2rem)] w-px bg-gray-200" />
          <ol className="space-y-6">
            {STEPS.map((step, i) => {
              const active = i === idxCurrent;
              const done = i < idxCurrent;
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
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    {done && <FiCheckCircle className="text-xs" />}
                  </span>

                  {/* label & button */}
                  <div className="flex-1">
                    <div
                      className={`text-sm ${
                        active ? "font-semibold text-brand-700" : ""
                      }`}
                    >
                      {step.label}
                    </div>

                    <button
                      disabled={!allowed || active || busy}
                      onClick={() => {
                        if (step.needsQty) {
                          setQtyPrompt({
                            step,
                            max: so.quantity,
                          });
                        } else {
                          fireAction(step);
                        }
                      }}
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

      {/* ---------------- qty prompt modal ---------------- */}
      <QuantityModal
        open={!!qtyPrompt}
        max={qtyPrompt?.max}
        onClose={() => setQtyPrompt(null)}
        onSubmit={(val) => {
          const { step } = qtyPrompt;
          fireAction(step, { qty: val });
          setQtyPrompt(null);
        }}
      />
    </>
  );
}
