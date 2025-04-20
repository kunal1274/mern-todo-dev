import {
  FiX,
  FiCheckCircle,
  FiExternalLink,
  FiMaximize,
  FiMaximize2,
  FiMinimize2,
} from "react-icons/fi";
import {
  triggerSOAction,
  triggerSOActionWithData,
} from "../../api/salesOrderService.js";
import { useState } from "react";
import { toast } from "react-toastify";
import MovementModal from "./MovementModal";
import { totals } from "../../utility/shyam-db/qtyMath.js";

/* --- status map & order (unchanged) -------------------------------- */
const ALLOWED = {
  Draft: ["Approved", "Cancelled", "AdminMode", "AnyMode"],
  Approved: ["Confirmed", "Cancelled", "AdminMode", "AnyMode"],
  Confirmed: [
    "Confirmed",
    "PartiallyShipped",
    "Shipped",
    "Cancelled",
    "AdminMode",
    "AnyMode",
  ],
  PartiallyShipped: [
    "PartiallyShipped",
    "PartiallyDelivered",
    "PartiallyInvoiced",
    "Delivered",
    "Cancelled",
    "AdminMode",
    "AnyMode",
  ],
  Shipped: [
    "PartiallyDelivered",
    "Delivered",
    "Cancelled",
    "AdminMode",
    "AnyMode",
  ],
  PartiallyDelivered: [
    "PartiallyDelivered",
    "PartiallyInvoiced",
    "Delivered",
    "Cancelled",
    "AdminMode",
    "AnyMode",
  ],
  Delivered: ["PartiallyInvoiced", "Invoiced", "AdminMode", "AnyMode"],
  PartiallyInvoiced: [
    "PartiallyInvoiced",
    "Invoiced",
    "Cancelled",
    "AdminMode",
    "AnyMode",
  ],
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

const STEPS = [
  { key: "approve", label: "Approve", status: "Approved" },
  { key: "confirm", label: "Confirm", status: "Confirmed" },
  {
    key: "ship", // this can be partially shipment as well.
    label: "Ship",
    status: "Shipped", // this can be partially shipped
    needsQty: "shippingQty",
    title: "Ship",
  },
  {
    key: "deliver",
    label: "Deliver",
    status: "Delivered",
    needsQty: "deliveringQty",
    title: "Deliver",
  },
  {
    key: "invoice",
    label: "Invoice",
    status: "Invoiced",
    needsQty: "invoicingQty",
    title: "Invoice",
  },
  { key: "cancel", label: "Cancel", status: "Cancelled" },
  { key: "draft", label: "Draft", status: "Draft" },
  { key: "admin", label: "Admin Mode", status: "AdminMode" },
  { key: "any", label: "Any Mode", status: "AnyMode" },
];

export default function ProcessFlowDrawer({ open, so, onClose, onDone }) {
  const [busy, setBusy] = useState(null);
  const [modal, setModal] = useState(null); // {step, remain, title}
  const [expand, setExpand] = useState(false);

  if (!open || !so) return null;

  /* ------------- qty calculations ------------- */
  const t = totals(so);

  const remainMap = {
    ship: t.remainToShip,
    deliver: t.remainToDeliver,
    invoice: t.remainToInvoice,
  };

  /* ------------- helpers ------------- */
  const idxCurrent = STEPS.findIndex((s) => s.status === so.status);
  const doneStatus = (s) =>
    idxCurrent > STEPS.findIndex((o) => o.status === s.status);
  const canGo = (nextStatus) => ALLOWED[so.status]?.includes(nextStatus);

  /* ------------- action fire ------------- */
  async function fire(step, extra) {
    setBusy(step.key);
    try {
      if (extra) {
        await triggerSOActionWithData(so._id, step.key, extra);
      } else {
        await triggerSOAction(so._id, step.key);
      }
      toast.success(`Status set to ${step.status}`);
      onDone();
    } catch (e) {
      toast.error(e.response?.data?.error || "Error");
    } finally {
      setBusy(null);
    }
  }

  /* ------------- UI ------------- */
  return (
    <>
      <aside
        className={`fixed right-0 top-0 z-40 h-full ${
          expand ? "w-2/3" : "w-1/3"
        } overflow-y-auto bg-white shadow-lg`}
      >
        <div className="flex items-center justify-between border-b p-4">
          {/* <h3 className="text-lg font-semibold">
            Process Flow — {so.orderNum}
          </h3> */}

          <div>
            <h3 className="text-lg font-semibold flex items-center">
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
          <div className="space-x-2">
            <button onClick={() => setExpand(!expand)}>
              {!expand ? (
                <FiMaximize2 className="text-lg" />
              ) : (
                <FiMinimize2 className="text-lg" />
              )}
            </button>
            <button onClick={onClose}>
              <FiX className="text-xl" />
            </button>
          </div>
        </div>

        {/* STEPPER */}
        <div className="relative m-8">
          <div className="absolute left-3 top-4 h-[calc(100%-2rem)] w-px bg-gray-200" />
          <ol className="space-y-6">
            {STEPS.map((step) => {
              const remain = remainMap[step.key];
              const active = so.status === step.status;
              const allowed = canGo(step.status);
              const done = doneStatus(step);
              const disabled = active || busy || !allowed || remain <= 0;
              return (
                <li key={step.key} className="flex items-start gap-4">
                  {/* node */}
                  <span
                    className={`relative mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full border
                      ${
                        active
                          ? "border-brand-600 bg-brand-50"
                          : done
                          ? "border-brand-600 bg-brand-600 text-white"
                          : "border-gray-300"
                      }`}
                  >
                    {done && <FiCheckCircle className="text-xs" />}
                    {active && (
                      <span
                        className={`absolute inline-flex h-full w-full animate-ping rounded-full border border-brand-300 ${
                          so.status === "Draft"
                            ? "bg-gray-600 text-gray-600"
                            : so.status === "Approved"
                            ? "bg-yellow-700 text-yellow-700"
                            : so.status === "Confirmed"
                            ? "bg-blue-700 text-blue-700"
                            : so.status === "Shipped"
                            ? "bg-emerald-700 text-emerald-700"
                            : so.status === "Delivered"
                            ? "bg-teal-700 text-teal-700"
                            : so.status === "Invoiced"
                            ? "bg-indigo-700 text-indigo-700"
                            : "bg-red-700 text-red-700"
                        }`}
                      />
                    )}
                  </span>

                  {/* label & button */}
                  <div className="flex-1">
                    <div
                      className={`text-sm ${
                        active ? "font-semibold text-brand-700" : ""
                      }`}
                    >
                      {step.label}
                      {step.needsQty && (
                        <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-[10px]">
                          {step.key === "ship"
                            ? `${t.shipped}/${so.quantity}`
                            : step.key === "deliver"
                            ? `${t.delivered}/${t.shipped}`
                            : `${t.invoiced}/${t.delivered}`}
                        </span>
                      )}
                      <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-[10px]">
                        {remain}
                      </span>
                    </div>

                    <button
                      //disabled={!allowed || active || busy}
                      disabled={disabled}
                      onClick={() => {
                        if (step.needsQty) {
                          const remain = remainMap[step.key];
                          if (remain <= 0) {
                            toast.error(
                              `Nothing remaining for this ${step.key} stage`
                            );
                            return;
                          }
                          setModal({
                            step,
                            remain,
                            title: step.title,
                          });
                        } else {
                          fire(step);
                        }
                      }}
                      className={`mt-1 rounded px-3 py-1 text-xs
                        ${
                          active
                            ? "bg-gray-400 text-white"
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

        {/* HISTORY TABLES */}
        {["shippingQty", "deliveringQty", "invoicingQty"].map((k) =>
          so[k]?.length ? (
            <div key={k} className="mt-8 px-6">
              <h4 className="mb-2 font-semibold">
                {k === "shippingQty"
                  ? "Shipments"
                  : k === "deliveringQty"
                  ? "Deliveries"
                  : "Invoices"}
              </h4>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 py-1">Qty</th>
                      <th className="px-2 py-1">Mode/Terms</th>
                      <th className="px-2 py-1">Ref ID</th>
                      <th className="px-2 py-1">Date</th>
                      {expand && <th className="px-2 py-1">Status</th>}
                      {expand && <th className="px-2 py-1">Status</th>}
                      {expand && <th className="px-2 py-1">Status</th>}
                      {expand && <th className="px-2 py-1">Status</th>}
                      {expand && <th className="px-2 py-1">Status</th>}
                      {expand && <th className="px-2 py-1">Status</th>}
                      <th className="px-2 py-1">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {so[k].map((r) => (
                      <tr key={r._id || r.date}>
                        <td className="px-2 py-1">{r.qty}</td>

                        <td className="px-2 py-1">
                          {r.shipmentMode || r.deliveryMode || r.paymentTerms}
                        </td>
                        <td className="px-2 py-1">
                          {r.shipmentId || r.deliveryId || r.invoicingId || "—"}
                        </td>
                        <td className="px-2 py-1">
                          {new Date(
                            r.date || r.invoiceDate
                          ).toLocaleDateString()}
                        </td>
                        {expand && <td className="px-2 py-1">{r.status}</td>}
                        {expand && <td className="px-2 py-1">{r.status}</td>}
                        {expand && <td className="px-2 py-1">{r.status}</td>}
                        {expand && <td className="px-2 py-1">{r.status}</td>}
                        {expand && <td className="px-2 py-1">{r.status}</td>}
                        {expand && <td className="px-2 py-1">{r.status}</td>}
                        <td className="px-2 py-1 flex gap-2">
                          {/* <button
                            onClick={() => setViewRow(r)}
                            className="text-xs underline"
                          >
                            View
                          </button> */}
                          {r.status === "Draft" && (
                            <button
                              onClick={() => updateRow("post", r)}
                              className="rounded border border-emerald-500 px-2 py-1 text-emerald-600 hover:bg-emerald-50 text-xs"
                            >
                              Post
                            </button>
                          )}
                          {r.status !== "Cancelled" && (
                            <button
                              onClick={() => updateRow("cancel", r)}
                              className="rounded border border-red-500 px-2 py-1 text-red-600 hover:bg-red-50 text-xs"
                            >
                              Cancel
                            </button>
                          )}
                          {r.status === "Posted" && (
                            <button
                              onClick={() => setCorrectRow(r)}
                              className="rounded border border-gray-500 px-2 py-1 text-gray-600 hover:bg-gray-50 text-xs"
                            >
                              Correct
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null
        )}

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

      {/* qty modal */}
      {modal && (
        <MovementModal
          open
          title={modal.title}
          max={modal.remain}
          totals={t}
          onClose={() => setModal(null)}
          onSubmit={(data) => {
            fire(modal.step, data);
            setModal(null);
          }}
        />
      )}
    </>
  );
}
