import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  addPayment,
  deleteFile,
  fetchSalesOrder,
  updateSalesOrder,
  uploadMulterFiles,
} from "../../api/salesOrderService.js";
import { FiArrowLeft, FiTruck, FiPackage, FiFileText } from "react-icons/fi";
import {
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFileCsv,
  FaFileVideo,
  FaFileAlt,
} from "react-icons/fa";

import PaymentModal from "../../components/shyam-db/PaymentModal.jsx";
import EditSalesOrderModal from "../../components/shyam-db/EditSalesOrderModal.jsx";
import ProcessFlowDrawer from "../../components/shyam-db/ProcessFlowDrawer.jsx";
import BankModal from "../../components/shyam-db/BankModal.jsx";
// import InsightsPanel from "../../components/ai/InsightsPanel.jsx";
import PromptDrawer from "../../components/ai/PromptDrawer.jsx";
import ChatBot from "../../components/ai/AIChatBot.jsx";
// import FileUploadModal from "../../components/shyam-db/FileUploadModal.jsx";
// import { uploadFiles as uploadSOFiles } from "../../api/salesOrderService.js";
// import { toast } from "react-toastify";
// import FileGallery from "../../components/shyam-db/FileGallery.jsx";
import FileUploadModal from "../../components/shyam-db/bb3FileUploadModal.jsx";
import FileGallery from "../../components/shyam-db/bb3FileGallery.jsx";
// import FileGallery from "../../components/shyam-db/FileGallery.jsx";

function FileIcon({ ext }) {
  switch (ext) {
    case "pdf":
      return <FaFilePdf className="text-red-500 text-2xl" />;
    case "doc":
    case "docx":
      return <FaFileWord className="text-blue-700 text-2xl" />;
    case "xls":
    case "xlsx":
      return <FaFileExcel className="text-green-600 text-2xl" />;
    case "csv":
      return <FaFileCsv className="text-green-800 text-2xl" />;
    case "mp4":
    case "mov":
    case "avi":
      return <FaFileVideo className="text-purple-600 text-2xl" />;
    default:
      return <FaFileAlt className="text-gray-700 text-2xl" />;
  }
}

const BASE = "http://localhost:5050";

export default function SalesOrderDetails() {
  const { id } = useParams();
  const nav = useNavigate();
  const [so, setSo] = useState(null);
  const [tab, setTab] = useState("ship"); // ship | deliver | invoice
  const [drawer, setDrawer] = useState(false);
  const [movement, setMovement] = useState(null); // {type:"ship"|... , remain}
  const [payModal, setPayModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [bankModal, setBankModal] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    fetchSalesOrder(id).then(setSo);
  }, [id]);

  if (!so)
    return (
      <div className="p-8 text-center text-gray-500">
        Loading sales order...
      </div>
    );

  /** helpers */
  const sum = (key) =>
    so[key]?.reduce((n, r) => n + r.qty, 0).toFixed(2) || "0.00";

  const Tabs = [
    { k: "ship", label: `Shipments (${so.shippingQty.length})`, icon: FiTruck },
    {
      k: "deliver",
      label: `Deliveries (${so.deliveringQty.length})`,
      icon: FiPackage,
    },
    {
      k: "invoice",
      label: `Invoices (${so.invoicingQty.length})`,
      icon: FiFileText,
    },
    {
      k: "payment",
      label: `Payments (${so.paidAmt.length})`,
      icon: FiFileText,
    },
  ];

  const updateFiles = (arr) => setSo((s) => ({ ...s, files: arr }));

  return (
    <section className="p-8">
      <ChatBot
        initialPrompt={`Ask about this sales order ${so.orderNum}`}
        orderNum={so.orderNum}
      />
      {/* header */}
      <StickyBar>
        <div className="mb-4 flex items-center gap-4 px-1 pt-4">
          <button
            onClick={() => nav(-1)}
            className="rounded border p-2 hover:bg-gray-50"
          >
            <FiArrowLeft />
          </button>
          <h2 className="text-2xl font-semibold">{so.orderNum}</h2>

          <span
            className={`rounded-full px-3 py-1 text-xs ${
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

          <div className="ml-auto flex gap-2">
            <button
              onClick={() => setEditModal(true)}
              className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
            >
              Edit
            </button>
            {so.archived ? (
              <button
                onClick={() =>
                  archiveSO(so._id, false).then(() =>
                    fetchSalesOrder(id).then(setSo)
                  )
                }
                className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
              >
                Un‑archive
              </button>
            ) : (
              <button
                onClick={() =>
                  archiveSO(so._id, true).then(() =>
                    fetchSalesOrder(id).then(setSo)
                  )
                }
                className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
              >
                Archive
              </button>
            )}
            <button
              onClick={() => {
                if (confirm("Delete this sales order?"))
                  deleteSO(so._id).then(() => nav("/sales-orders"));
              }}
              className="rounded border px-2 py-1 text-xs text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
            <button
              onClick={() => setDrawer(true)}
              className="rounded bg-brand-600 px-2 py-1 text-xs font-medium text-white hover:bg-brand-500"
            >
              Process Flow
            </button>
            <button
              onClick={() => {
                exportSingle(so._id).then((blob) => {
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${so.orderNum}.xlsx`;
                  a.click();
                  URL.revokeObjectURL(url);
                });
              }}
              className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
            >
              Export
            </button>
            <button
              onClick={() => setPromptOpen(true)}
              className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
            >
              Ask AI about this order
            </button>
          </div>
        </div>

        {/**Printing different documents */}

        {/* <div className="mt-2 mb-4 flex gap-2 justify-end px-1">
          {["proforma", "confirmation", "shipment", "delivery", "invoice"].map(
            (t) => (
              <a
                key={t}
                href={`${import.meta.env.VITE_API_URL}/sales-orders/${
                  so._id
                }/print/${t}`}
                target="_blank"
                className="rounded border px-3 py-1 text-xs hover:bg-gray-100"
              >
                Print {t.charAt(0).toUpperCase() + t.slice(1)}
              </a>
            )
          )}
        </div> */}
      </StickyBar>
      {/* <InsightsPanel orderId={so._id} /> */}
      {/* <StickyBar className="px-8">
        <InsightsPanel orderId={so._id} />
      </StickyBar> */}

      {/* two‑column grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* customer block */}
        <div className="rounded-lg border bg-white p-6">
          <h4 className="mb-4 text-lg font-medium">Customer</h4>
          <DetailRow ds={so} label="Code" value={so.customer.code} />
          <DetailRow ds={so} label="Name" value={so.customer.name} />
          <DetailRow ds={so} label="Contact" value={so.customer.contactNum} />
          <DetailRow ds={so} label="Address" value={so.salesAddress} />
          <DetailRow ds={so} label="Currency" value={so.currency} />
        </div>

        {/* item block */}
        <div className="rounded-lg border bg-white p-6">
          <h4 className="mb-4 text-lg font-medium">Item & Amount</h4>
          <DetailRow
            ds={so}
            label="Item"
            value={`${so.item.code} – ${so.item.name}`}
          />
          <DetailRow ds={so} label="Quantity" value={so.quantity} />
          <DetailRow ds={so} label="Unit Price" value={so.price} />
          <DetailRow ds={so} label="Charges" value={so.charges} />
          <DetailRow ds={so} label="Discount %" value={so.discount} />
          <DetailRow ds={so} label="Tax %" value={so.tax} />
          <DetailRow
            ds={so}
            label="Net Amount"
            value={`${so.currency} ${so.netAmtAfterTax.toFixed(2)}`}
          />
        </div>

        {/* finance summary full‑width */}
        <div className="lg:col-span-2 rounded-lg border bg-white p-6">
          <h4 className="mb-4 text-lg font-medium">Financial Summary</h4>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <SummaryBox
              title="Shipped"
              value={`${sum("shippingQty")} / ${so.quantity}`}
            />
            <SummaryBox
              title="Delivered"
              value={`${sum("deliveringQty")} / ${sum("shippingQty")}`}
            />
            <SummaryBox
              title="Invoiced"
              value={`${sum("invoicingQty")} / ${sum("deliveringQty")}`}
            />
            <SummaryBox
              title="Advance"
              value={`${so.currency} ${so.advance.toFixed(2)}`}
            />
            <SummaryBox
              title="Paid"
              value={`${so.currency} ${(so.totalPaid || 0).toFixed(2)}`}
            />
            <button
              onClick={() => setPayModal(true)}
              className="mt-4 rounded border px-3 py-1 text-xs hover:bg-gray-50"
            >
              Add Payment
            </button>
            <button
              onClick={() => setBankModal(true)}
              className="mt-4 rounded border px-3 py-1 text-xs hover:bg-gray-50"
            >
              Banks
            </button>
          </div>
        </div>
      </div>

      {/**Printing different documents */}

      <div className="mt-8 flex gap-2">
        {["proforma", "confirmation", "shipment", "delivery", "invoice"].map(
          (t) => (
            <a
              key={t}
              href={`${import.meta.env.VITE_API_URL}/sales-orders/${
                so._id
              }/print/${t}`}
              target="_blank"
              className="rounded border px-3 py-1 text-xs hover:bg-gray-100"
            >
              Print {t.charAt(0).toUpperCase() + t.slice(1)}
            </a>
          )
        )}
      </div>

      {/* attachments panel */}
      <div className="mt-8 rounded-lg border bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium">
            Attachments ({so?.files?.length})
          </h4>
          <button
            onClick={() => setUploadOpen(true)}
            className="rounded border px-3 py-1 text-xs hover:bg-gray-50"
          >
            + Upload
          </button>
        </div>
        {/* 
        {so?.files?.length ? (
          <ul className="space-y-1 text-sm">
            {so.files.map((f) => {
              const fullUrl = `${BASE}${f.fileUrl}`;
              const ext = f.originalName?.split(".").pop().toLowerCase();
              const isImage = /\.(jpe?g|png|gif)$/i.test(f.originalName);

              return (
                <li className="py-1" key={f._id}>
                  <div className="flex flex-row space-x-1 items-center">
                    {isImage ? (
                      <img
                        src={fullUrl}
                        alt={`${f.originalName}`}
                        className="w-[40px] h-[40px] object-cover border rounded-md mr-3"
                      />
                    ) : (
                      <FileIcon ext={ext} className="mr-3" />
                    )}

                    <a
                      className="text-brand-600 hover:underline"
                      href={fullUrl}
                      target="_blank"
                    >
                      {f.originalName}
                    </a>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No files.</p>
        )} */}

        <FileGallery
          soId={so._id}
          files={so.files}
          onChange={(arr) => setSo((s) => ({ ...s, files: arr }))}
        />
      </div>

      <FileUploadModal
        open={uploadOpen}
        soId={so._id}
        onClose={() => setUploadOpen(false)}
        onDone={(arr) => setSo((s) => ({ ...s, files: arr }))}
      />

      {/* <FileUploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUpload={(files) => {
          uploadMulterFiles(so._id, files)
            .then((r) => {
              setSo((s) => ({ ...s, files: r.data.data }));
              setUploadOpen(false);
            })
            // .catch(() => alert("upload failed"));
            .catch((err) => {
              toast.error(err.response?.data?.message || "Upload failed");
            });
        }}
      /> */}

      {/* history tabs */}
      <div className="mt-10 rounded-lg border bg-white">
        <nav className="flex gap-4 border-b p-4 text-sm font-medium">
          {Tabs.map((t) => (
            <button
              key={t.k}
              onClick={() => setTab(t.k)}
              className={`inline-flex items-center gap-1 px-2 py-1 ${
                tab === t.k ? "border-b-2 border-brand-600 text-brand-700" : ""
              }`}
            >
              <t.icon className="text-xs" />
              {t.label}
            </button>
          ))}
          <div className="ml-auto">
            {tab === "ship" && (
              <button
                onClick={() =>
                  setMovement({ type: "ship", remain: t.remainToShip })
                }
                className="rounded bg-brand-600 px-3 py-1 text-xs text-white hover:bg-brand-500"
              >
                + Add Shipment
              </button>
            )}
            {tab === "deliver" && (
              <button
                onClick={() =>
                  setMovement({
                    type: "deliver",
                    remain: t.remainToDeliver,
                  })
                }
                className="rounded bg-brand-600 px-3 py-1 text-xs text-white hover:bg-brand-500"
              >
                + Add Delivery
              </button>
            )}
            {tab === "invoice" && (
              <button
                onClick={() =>
                  setMovement({
                    type: "invoice",
                    remain: t.remainToInvoice,
                  })
                }
                className="rounded bg-brand-600 px-3 py-1 text-xs text-white hover:bg-brand-500"
              >
                + Add Invoice
              </button>
            )}
          </div>
        </nav>

        <HistoryTable
          rows={
            tab === "ship"
              ? so[tab + "pingQty"]
              : tab === "deliver"
              ? so[tab + "ingQty"]
              : tab === "invoice"
              ? so["invoicingQty"]
              : so["paidAmt"]
          }
          tab={tab}
        />
      </div>
      {/* Edit modal */}
      <EditSalesOrderModal
        open={editModal}
        initial={so}
        onClose={() => setEditModal(false)}
        onSave={(data) =>
          updateSalesOrder(so._id, data).then(() =>
            fetchSalesOrder(id).then((d) => {
              setSo(d);
              setEditModal(false);
            })
          )
        }
      />

      {/* Movement modal */}
      {movement && (
        <MovementModal
          open
          title={
            movement.type === "ship"
              ? "Ship"
              : movement.type === "deliver"
              ? "Deliver"
              : "Invoice"
          }
          max={movement.remain}
          onClose={() => setMovement(null)}
          onSubmit={(data) => {
            const fn =
              movement.type === "ship"
                ? addShipment
                : movement.type === "deliver"
                ? addDelivery
                : addInvoice;
            fn(so._id, data).then(() =>
              fetchSalesOrder(id).then((d) => {
                setSo(d);
                setMovement(null);
              })
            );
          }}
        />
      )}
      {/* Payment modal */}
      <PaymentModal
        open={payModal}
        currency={so.currency}
        onClose={() => setPayModal(false)}
        onSubmit={(p) =>
          addPayment(so._id, p).then(() =>
            fetchSalesOrder(id).then((d) => {
              setSo(d);
              setPayModal(false);
            })
          )
        }
      />
      {/* Process flow drawer */}
      <ProcessFlowDrawer
        open={drawer}
        so={so}
        onClose={() => setDrawer(false)}
        onDone={() => fetchSalesOrder(id).then((d) => setSo(d))}
      />
      <BankModal
        open={bankModal}
        soId={so._id}
        onClose={() => setBankModal(false)}
      />
      <PromptDrawer
        open={promptOpen}
        orderJson={so}
        onClose={() => setPromptOpen(false)}
      />
    </section>
  );
}

/* ---------------- helpers ---------------- */

function DetailRow({ ds, label, value }) {
  return (
    <div className="mb-2 flex justify-between gap-4 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium">
        {label === "Code" ? (
          <Link
            to={`/customers/${ds.customer._id}`}
            className="text-brand-600 underline"
          >
            {ds.customer.code}
          </Link>
        ) : label === "Item" ? (
          <Link
            to={`/customers/${ds.item._id}`}
            className="text-brand-600 underline"
          >
            {ds.item.code} – ${ds.item.name}
          </Link>
        ) : (
          value || "—"
        )}
      </span>
    </div>
  );
}

function SummaryBox({ title, value }) {
  return (
    <div className="rounded border bg-gray-50 p-4 text-center">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}

function HistoryTable({ rows, tab }) {
  if (!rows?.length)
    return <p className="p-6 text-sm text-gray-500">No data.</p>;

  const modeCol =
    tab === "ship"
      ? "shipmentMode"
      : tab === "deliver"
      ? "deliveryMode"
      : tab === "invoice"
      ? "paymentTerms"
      : "paymentMode";
  const qtyCol = tab === "payment" ? "amount" : "qty";

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left">
              {tab === "payment" ? "Amt" : "Qty"}
            </th>
            <th className="px-3 py-2 text-left">
              {tab === "invoice" ? "Terms" : "Mode"}
            </th>
            <th className="px-3 py-2 text-left">Reference ID</th>
            <th className="px-3 py-2 text-left">Date</th>
            <th className="px-3 py-2 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r._id || r.date}>
              <td className="px-3 py-2">{r[qtyCol]}</td>
              <td className="px-3 py-2">{r[modeCol]}</td>
              <td className="px-3 py-2">
                {r.shipmentId ||
                  r.deliveryId ||
                  r.invoicingId ||
                  r.paymentId ||
                  "—"}
              </td>
              <td className="px-3 py-2">
                {new Date(r.date || r.invoiceDate).toLocaleDateString()}
              </td>
              <td className="px-3 py-2">{r.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ----------------- util ------------------ */
function StickyBar({ children, className = "" }) {
  return (
    <div
      className={`sticky mt-2 mb-2 top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-white/80 border-b ${className}`}
    >
      {children}
    </div>
  );
}
// original
/* ----------------- util ------------------ */
function StickyBar1({ children, className = "" }) {
  return (
    <div
      className={`sticky top-0 z-30 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 border-b ${className}`}
    >
      {children}
    </div>
  );
}
