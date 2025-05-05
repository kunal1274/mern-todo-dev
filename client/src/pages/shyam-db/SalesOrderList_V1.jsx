//1. export import duplicate are working but not all fields are added

import { useState, useRef } from "react";
import {
  FiPlus,
  FiTrash,
  FiArchive,
  FiSearch,
  FiMoreVertical,
  FiRefreshCw,
  FiRefreshCcw,
  FiUpload,
  FiDownload,
  FiCopy,
  FiDelete,
  FiTrash2,
  FiDroplet,
  FiCrosshair,
} from "react-icons/fi";
import {
  RiCollapseHorizontalFill,
  RiExpandHorizontalFill,
} from "react-icons/ri";
// import { Link } from "react-router-dom";
import useSalesOrders from "../../hooks/shyam-db/useSalesOrders";
import SalesOrderModal from "../../components/shyam-db/SalesOrderModal.jsx";
import TableHeadSort from "../../components/shyam-db/TableHeadSort.jsx";
import ProcessFlowDrawerCrystal from "../../components/shyam-db/ProcessFlowDrawer.jsx";
// import {
//   exportSalesOrders,
//   importSalesOrders,
// } from "../../api/salesOrderService.js";
import { ToastContainer } from "react-toastify";
import GridActionMenu from "../../components/shyam-db/GridActionMenu.jsx";
import ChatBot from "../../components/ai/AIChatBot.jsx";
import {
  duplicateSO,
  exportSalesOrders,
  importSalesOrders,
} from "../../api/salesOrderService.js";
import LinkTab from "../../components/shyam-db/layout/LinkTab.jsx";
import showImportToast from "../../components/shyam-db/ImportStatusToast.jsx";

export function Spinner() {
  return (
    <span className="spin h-4 w-4 border-2 border-t-transparent rounded-full"></span>
  );
}

export default function SalesOrderListCrystal() {
  const {
    orders,
    loading,
    refresh,
    create,
    update,
    remove,
    archive,
    setQuery,
  } = useSalesOrders();

  const [sort, setSort] = useState({ key: "createdAt", dir: "desc" });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [drawer, setDrawer] = useState({ open: false, so: null });
  const [showAllCols, setShowAllCols] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [busy, setBusy] = useState(false);
  const [busyExport, setBusyExport] = useState(false);

  const fileRef = useRef();

  // client‑side sort for demo
  const sorted = [...orders].sort((a, b) => {
    const v1 = a[sort.key];
    const v2 = b[sort.key];
    if (v1 === v2) return 0;
    return sort.dir === "asc" ? (v1 > v2 ? 1 : -1) : v1 < v2 ? 1 : -1;
  });

  const bulkArchive = (flag) =>
    Promise.all(
      orders.filter((o) => selected.has(o._id)).map((o) => archive(o._id, flag))
    ).then(() => refresh());

  const toggle = (id) =>
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const toggleAll = (checked) =>
    setSelected(checked ? new Set(orders.map((o) => o._id)) : new Set());

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBusy(true);
    try {
      const result = await importSalesOrders(file);
      showImportToast(result);
      refresh(); // whatever re-loads your list
    } catch (err) {
      toast.error(err.response?.data?.message || "Import failed");
    } finally {
      setBusy(false);
      // clear so the same file triggers onChange next time
      e.target.value = "";
    }
  };

  return (
    <section>
      <ChatBot initialPrompt="Ask me anything about Sales Orders …" />
      {/* ---------- header row ---------- */}
      <div className="mt-4 mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold">Sales Orders</h2>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              onChange={(e) =>
                setQuery((q) => ({ ...q, search: e.target.value }))
              }
              className="rounded-lg bg-gray-100 pl-10 pr-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-brand-600"
              placeholder="Search..."
            />
          </div>
          <GridActionMenu
            onEdit={() => {
              setEditing(o);
              setModalOpen(true);
            }}
            onArchive={() => archive(o._id, !o.archived)}
            onProcess={() => setDrawer({ open: true, so: o })}
            onDelete={() => remove(o._id)}
          />

          <button
            onClick={() => refresh()}
            className="inline-flex items-center gap-1 rounded border px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            <FiRefreshCw /> Refresh
          </button>
          <button
            onClick={() => setShowAllCols((s) => !s)}
            className="inline-flex items-center gap-1 rounded border px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            {showAllCols ? (
              <>
                <RiCollapseHorizontalFill />
                Fewer fields
              </>
            ) : (
              <>
                <RiExpandHorizontalFill />
                More fields
              </>
            )}
          </button>

          {/* <input
            id="importFile"
            type="file"
            className="hidden"
            onChange={(e) =>
              //importSalesOrders(e.target.files[0]).then(() => refresh())
              importSalesOrders(e.target.files[0])
                .then((res) => {
                  showImportToast(res); // new helper
                  refresh();
                })
                .catch((err) =>
                  toast.error(err.response?.data?.message || "Import failed")
                )
            }
          /> */}
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />
          {/* <button
            disabled={busy}
            onClick={() => document.getElementById("importFile").click()}
            className="inline-flex items-center gap-1 rounded border px-3 py-1.5 text-sm hover:bg-gray-50"
          > 
            <FiDownload /> {busy ? <Spinner /> : "Import"}
          </button>
          */}
          <button
            disabled={busy}
            onClick={() => fileRef.current.click()}
            className="inline-flex items-center gap-1 rounded border px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            <FiDownload /> {busy ? <Spinner /> : "Import"}
          </button>
          <button
            // onClick={async () => {
            //   const blob = await exportSalesOrders("xlsx");
            //   const url = URL.createObjectURL(blob);
            //   const a = document.createElement("a");
            //   a.href = url;
            //   a.download = "sales-orders.xlsx";
            //   a.click();
            //   URL.revokeObjectURL(url);
            // }}
            disabled={busyExport}
            onClick={async () => {
              setBusyExport(true);
              try {
                const blob = await exportSalesOrders("xlsx"); // already a Blob
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                const now = new Date();
                const readableDate = now
                  .toISOString()
                  .slice(0, 10)
                  .replace(/-/g, "");
                const time = now.toTimeString().split(" ")[0].replace(/:/g, "");
                const uniquePrefix = `${readableDate}-${time}-${Math.round(
                  Math.random() * 1e9
                )}`;
                //const uniquePrefix = `${readableDate}-${time}`;
                a.download = `${uniquePrefix}_sales-orders.xlsx`;
                a.click();
                URL.revokeObjectURL(url);
              } finally {
                setBusyExport(false);
              }
            }}
            // the below also working with array buffer
            // onClick={async () => {
            //   setBusy(true);
            //   try {
            //     const buffer = await exportSalesOrders("xlsx");
            //     const blob = new Blob([buffer], {
            //       type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            //     });
            //     const url = URL.createObjectURL(blob);
            //     const a = document.createElement("a");
            //     a.href = url;
            //     a.download = "sales-orders.xlsx";
            //     a.click();
            //     URL.revokeObjectURL(url);
            //   } finally {
            //     setBusy(false);
            //   }
            // }}
            className="inline-flex items-center gap-1 rounded border px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            <FiUpload /> {busyExport ? <Spinner /> : "Export"}
          </button>
          {/* <button
            onClick={() => {
              setDrawer({ open: true, so: o });
            }}
            className="block w-full px-3 py-2 text-left hover:bg-gray-50"
          >
            Process
          </button> */}
          <button
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-1 rounded bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-600/90"
          >
            <FiPlus /> New
          </button>
        </div>
      </div>

      {orders.some((o) => selected.has(o._id)) && (
        <div className="mb-2 flex gap-2 text-sm">
          <button
            // onClick={() =>
            //   Promise.all(
            //     //orders.filter((o) => o._checked).map((o) => duplicateSO(o._id))
            //     orders
            //       .filter((o) => selected.has(o._id))
            //       .map((o) => duplicateSO(o._id))
            //   ).then(refresh)
            // }
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              await Promise.all(
                Array.from(selected).map((id) => duplicateSO(id))
              );
              setBusy(false);
              refresh();
            }}
            className="inline-flex items-center gap-1 rounded border px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            <FiCopy /> {busy ? <Spinner /> : "Duplicate"}
          </button>
          <button
            onClick={() => bulkArchive(true)}
            className="inline-flex items-center gap-1 rounded border px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            <FiArchive /> Archive
          </button>
          <button
            onClick={() => bulkArchive(false)}
            className="inline-flex items-center gap-1 rounded border px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            <FiArchive className="rotate-180" /> Un‑archive
          </button>
          <button
            onClick={() =>
              Promise.all(
                orders.filter((o) => o._checked).map((o) => deleteSO(o._id))
              ).then(refresh)
            }
            className="inline-flex items-center gap-1 rounded border px-3 py-1.5 text-sm text-red-600 hover:bg-gray-50"
          >
            <FiTrash2 /> Delete
          </button>
        </div>
      )}

      {/* ---------- table ---------- */}
      <div
        className="overflow-auto rounded-lg border bg-white max-h-[400px]"
        style={{ minHeight: "200px" }}
      >
        <table className="min-w-full divide-y">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="w-10 px-4">
                {/* <input
                  type="checkbox"
                  onChange={(e) =>
                    orders.forEach((o) => (o._checked = e.target.checked))
                  }
                /> */}
                <input
                  type="checkbox"
                  checked={selected.size && selected.size === orders.length}
                  indeterminate={
                    selected.size && selected.size !== orders.length
                  }
                  onChange={(e) => toggleAll(e.target.checked)}
                />
              </th>
              <TableHeadSort
                label="Order #"
                sortKey="orderNum"
                sort={sort}
                setSort={setSort}
              />
              <TableHeadSort
                label="Customer"
                sortKey="customer.name"
                sort={sort}
                setSort={setSort}
              />
              <TableHeadSort
                label="Amount"
                sortKey="netAmtAfterTax"
                sort={sort}
                setSort={setSort}
              />
              <TableHeadSort
                label="Status"
                sortKey="status"
                sort={sort}
                setSort={setSort}
              />
              <TableHeadSort
                label="Created"
                sortKey="createdAt"
                sort={sort}
                setSort={setSort}
              />
              <th className="w-8 px-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan={7} className="p-6 text-center">
                  Loading...
                </td>
              </tr>
            ) : sorted.length ? (
              sorted.map((o) => (
                <tr
                  key={o._id}
                  className={`${
                    o._checked
                      ? "bg-brand-50/40"
                      : o.archived
                      ? "bg-yellow-50/40"
                      : ""
                  } hover:bg-gray-50`}
                >
                  <td className="px-4">
                    {/* <input
                      type="checkbox"
                      checked={o._checked || false}
                      onChange={(e) => (o._checked = e.target.checked)}
                    /> */}
                    <input
                      type="checkbox"
                      checked={selected.has(o._id)}
                      onChange={() => toggle(o._id)}
                    />
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-sm font-medium text-brand-600">
                    <LinkTab
                      to={`/sales-orders/${o._id}`}
                      title={
                        <>
                          <FiDroplet />
                          Sales Order : {o.orderNum}
                        </>
                      }
                      className="hover:underline"
                    >
                      {o.orderNum}
                    </LinkTab>
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {o.customer?.name || "--"}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {o.currency} {o.netAmtAfterTax.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-sm">{o.status}</td>
                  <td className="px-4 py-2 text-sm">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">
                    <div className="relative group">
                      <FiMoreVertical className="cursor-pointer" />
                      {/* hover menu */}
                      <div className="invisible absolute right-0 top-4 z-10 w-32 divide-y rounded border bg-white text-sm shadow group-hover:visible">
                        <button
                          onClick={() => {
                            setEditing(o);
                            setModalOpen(true);
                          }}
                          className="block w-full px-3 py-2 text-left hover:bg-gray-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => archive(o._id, !o.archived)}
                          className="block w-full px-3 py-2 text-left hover:bg-gray-50"
                        >
                          {o.archived ? "Un‑archive" : "Archive"}
                        </button>
                        <button
                          onClick={() => {
                            setDrawer({ open: true, so: o });
                          }}
                          className="block w-full px-3 py-2 text-left hover:bg-gray-50"
                        >
                          Process
                        </button>
                        <button
                          onClick={() => remove(o._id)}
                          className="block w-full px-3 py-2 text-left text-red-600 hover:bg-gray-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="p-6 text-center text-sm">
                  No data.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ---------- modal ---------- */}
      <SalesOrderModal
        open={modalOpen}
        initial={editing || {}}
        onClose={() => setModalOpen(false)}
        onSubmit={(data) =>
          (editing ? update(editing._id, data) : create(data)).then(() =>
            setModalOpen(false)
          )
        }
      />
      <ProcessFlowDrawerCrystal
        open={drawer.open}
        so={drawer.so}
        onClose={() => setDrawer({ open: false })}
        onDone={() => {
          setDrawer({ open: false });
          refresh();
        }}
      />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </section>
  );
}
