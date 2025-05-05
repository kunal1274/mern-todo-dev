/* ────────────────────────────────────────────────────────────────
   components/shyam-db/FileUploadModal.jsx
   (fully replaces your previous draft)
   ──────────────────────────────────────────────────────────────── */
import {
  Dialog,
  Transition,
  DialogPanel,
  TransitionChild,
  DialogTitle,
} from "@headlessui/react";
import { Fragment, useState } from "react";
import { FiX, FiLoader } from "react-icons/fi";
import { toast } from "react-toastify";
import { uploadMulterFiles } from "../../api/salesOrderService";
import clsx from "clsx";
import axios from "axios";

const BASE = "http://localhost:5050";

export function FileUploadModal1({ open, soId, onClose, onDone }) {
  const [sel, setSel] = useState([]); // FileList
  const [busy, setBusy] = useState(false);

  const startUpload = () => {
    console.log("23 File modal", sel.length);
    if (!sel.length) return;

    const fd = new FormData();
    [...sel].forEach((f) => fd.append("files", f));

    console.log(`selected files`, sel, fd);

    setBusy(true);
    uploadMulterFiles(soId, fd)
      .then(onDone) // <- parent gets new array
      .catch((e) => toast.error(e.response?.data?.message || "Upload failed"))
      .finally(() => {
        setBusy(false);
        setSel([]);
        onClose();
      });
  };

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-[70]"
        onClose={() => !busy && onClose()}
      >
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40" />
        </TransitionChild>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="scale-95 opacity-0"
            enterTo="scale-100 opacity-100"
            leave="ease-in duration-150"
            leaveFrom="scale-100 opacity-100"
            leaveTo="scale-95 opacity-0"
          >
            <DialogPanel className="w-full max-w-md overflow-hidden rounded-lg bg-white shadow">
              <div className="flex items-center justify-between border-b px-6 py-4">
                <DialogTitle className="text-lg font-medium">
                  Upload files
                </DialogTitle>
                <button
                  onClick={onClose}
                  disabled={busy}
                  className="text-gray-500 hover:text-gray-800"
                >
                  <FiX />
                </button>
              </div>

              <div className="p-6 space-y-4 text-sm">
                <input
                  type="file"
                  multiple
                  onChange={(e) => setSel(e.target.files)}
                />
                {sel.length > 0 && (
                  <ul className="list-disc ml-5">
                    {[...sel].map((f) => (
                      <li key={f.name}>{f.name}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="border-t px-6 py-4 text-right">
                <button
                  onClick={startUpload}
                  disabled={!sel.length || busy}
                  className={`inline-flex items-center gap-2 rounded px-4 py-1.5 text-white ${
                    sel.length && !busy
                      ? "bg-brand-600 hover:bg-brand-500"
                      : "bg-gray-300"
                  }`}
                >
                  {busy && <FiLoader className="animate-spin text-sm" />}
                  Upload
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}

export default function FileUploadModal({ open, soId, onClose, onDone }) {
  const [sel, setSel] = useState([]); // File[]
  const [busy, setBusy] = useState(false);

  const startUpload = async () => {
    if (!sel.length) return;
    const fd = new FormData();
    sel.forEach((f) => fd.append("files", f));

    setBusy(true);
    // console.log("134");
    // const response = await axios.post(
    //   `${BASE}/fms/api/v0/sales-orders/${soId}/upload-files`,
    //   fd
    // );
    // console.log("139", response);
    try {
      const { data } = await axios.post(
        `${BASE}/fms/api/v0/sales-orders/${soId}/upload-files`,
        fd
      );
      // console.log("140", data);
      onDone(data.files);
      // console.log("fd", fd);
      toast.success("Uploaded!");
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setBusy(false);
      setSel([]);
    }
  };

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={() => !busy && onClose()}
      >
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40" />
        </TransitionChild>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="scale-95 opacity-0"
            enterTo="scale-100 opacity-100"
            leave="ease-in duration-150"
            leaveFrom="scale-100 opacity-100"
            leaveTo="scale-95 opacity-0"
          >
            <DialogPanel className="w-full max-w-md overflow-hidden rounded-lg bg-white shadow-lg">
              <div className="flex items-center justify-between border-b px-6 py-4">
                <DialogTitle className="text-lg font-medium">
                  Upload files
                </DialogTitle>
                <button
                  onClick={onClose}
                  disabled={busy}
                  className="text-gray-500 hover:text-gray-800"
                >
                  <FiX />
                </button>
              </div>

              <div className="p-6 space-y-4 text-sm">
                <input
                  type="file"
                  multiple
                  onChange={(e) => setSel(Array.from(e.target.files || []))}
                />
                {sel.length > 0 && (
                  <ul className="list-disc ml-5">
                    {sel.map((f) => (
                      <li key={f.name}>{f.name}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="border-t px-6 py-4 text-right">
                <button
                  onClick={startUpload}
                  disabled={!sel.length || busy}
                  className={clsx(
                    "inline-flex items-center gap-2 rounded px-4 py-1.5 text-white",
                    sel.length && !busy
                      ? "bg-blue-600 hover:bg-blue-500"
                      : "bg-gray-300"
                  )}
                >
                  {busy && <FiLoader className="animate-spin text-sm" />}
                  Upload
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
