/* ────────────────────────────────────────────────────────────────
   components/shyam-db/FileGallery.jsx
   ──────────────────────────────────────────────────────────────── */
import { useState } from "react";
import { FiGrid, FiList, FiDownload, FiTrash2, FiLoader } from "react-icons/fi";
import clsx from "clsx";
import { deleteFile } from "../../api/salesOrderService";
import { toast } from "react-toastify";
import axios from "axios";

const BASE = "http://localhost:5050";
// const BASE_FILE_URL = "http://localhost:5050";

const isImg1 = (mime) => mime.startsWith("image/");

export function FileGallery1({ soId, files = [], onChange }) {
  const [mode, setMode] = useState("list"); // card | list
  const [busyId, setBusyId] = useState(null);

  console.log("15 files gallery", files);

  /* ---------- helpers ---------- */
  const handleDelete = (fid) => {
    setBusyId(fid);
    deleteFile(soId, fid)
      .then(onChange) // server returns fresh array
      .finally(() => setBusyId(null));
  };

  /* ---------- UI pieces ---------- */
  const IconBtn = ({ onClick, title, children }) => (
    <button
      onClick={onClick}
      className="p-1.5 rounded hover:bg-gray-100"
      title={title}
    >
      {children}
    </button>
  );

  const Card = ({ f }) => (
    <div
      className="relative flex flex-col rounded border p-3 text-sm"
      key={f._id}
    >
      {isImg(f.fileType) ? (
        <img
          src={f.fileUrl}
          alt={f.fileOriginalName}
          className="h-16 w-full object-cover rounded"
        />
      ) : (
        <div className="flex h-32 w-full items-center justify-center rounded bg-gray-50 text-xs text-gray-500">
          {f.fileType}
        </div>
      )}

      <span className="mt-2 truncate">{f.fileOriginalName}</span>

      <div className="absolute right-1 top-1 flex gap-1">
        <IconBtn onClick={() => window.open(f.fileUrl)} title="Download">
          <FiDownload />
        </IconBtn>
        <IconBtn onClick={() => handleDelete(f._id)} title="Delete">
          {busyId === f._id ? (
            <FiLoader className="animate-spin" />
          ) : (
            <FiTrash2 />
          )}
        </IconBtn>
      </div>
    </div>
  );

  const Row = ({ f }) => {
    const fullUrl = `${import.meta.env.VITE_BACKEND_API_URL_ERP}${f.fileUrl}`;
    const ext = f.fileOriginalName.split(".").pop().toLowerCase();
    return (
      <li
        key={f._id}
        className="flex items-center gap-3 rounded px-2 py-1 hover:bg-gray-50"
      >
        {isImg(f.fileType) ? (
          <img
            src={fullUrl}
            alt={f.fileOriginalName}
            className="h-9 w-9 rounded object-cover"
          />
        ) : (
          <span className="h-9 w-9 flex items-center justify-center rounded bg-gray-100 text-[10px] leading-none">
            {f.fileType.split("/")[1] || "DOC"}
          </span>
        )}

        <a
          href={fullUrl}
          target="_blank"
          className="flex-1 truncate text-brand-600 hover:underline"
        >
          {f.fileOriginalName}
        </a>

        <IconBtn onClick={() => window.open(fullUrl)} title="Download">
          <FiDownload />
        </IconBtn>
        <IconBtn onClick={() => handleDelete(f._id)} title="Delete">
          {busyId === f._id ? (
            <FiLoader className="animate-spin" />
          ) : (
            <FiTrash2 />
          )}
        </IconBtn>
      </li>
    );
  };

  /* ---------- render ---------- */
  if (!files.length) return <p className="text-sm text-gray-500">No files.</p>;

  return (
    <>
      {/* header toggle */}
      <div className="mb-2 flex items-center justify-end gap-2 text-xs">
        {/* <span>View:</span> */}
        <IconBtn
          onClick={() => setMode("card")}
          title="Card view"
          className={clsx(mode === "card" && "text-brand-600")}
        >
          <FiGrid />
        </IconBtn>
        <IconBtn
          onClick={() => setMode("list")}
          title="List view"
          className={clsx(mode === "list" && "text-brand-600")}
        >
          <FiList />
        </IconBtn>
      </div>

      {mode === "card" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {files?.map((f) => (
            <Card key={f._id} f={f} />
          ))}
        </div>
      ) : (
        <ul className="divide-y border rounded">
          {files?.map((f) => Row({ f }))}
        </ul>
      )}
    </>
  );
}

const isImage = (filename) => /\.(jpe?g|png|gif)$/i.test(filename);

export default function FileGallery({ soId, files = [], onChange }) {
  const [mode, setMode] = useState("list"); // "card" or "list"
  const [busyId, setBusyId] = useState(null);

  const handleDelete = async (fileId) => {
    // console.log("fileid", fileId);
    setBusyId(fileId);
    try {
      await axios.delete(
        `${BASE}/fms/api/v0/sales-orders/${soId}/files/${fileId}`
      );
      onChange(files.filter((f) => f._id !== fileId));
      toast.success("Deleted");
    } catch {
      toast.error("Could not delete");
    } finally {
      setBusyId(null);
    }
  };

  if (!files.length) return <p className="text-sm text-gray-500">No files.</p>;

  return (
    <>
      <div className="mb-2 flex justify-end gap-2 text-xs">
        <button
          onClick={() => setMode("card")}
          className={clsx(mode === "card" && "text-blue-600")}
        >
          <FiGrid />
        </button>
        <button
          onClick={() => setMode("list")}
          className={clsx(mode === "list" && "text-blue-600")}
        >
          <FiList />
        </button>
      </div>

      {mode === "card" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {files.map((f) => {
            const url = `${BASE}${f.fileUrl}`;
            return (
              <div
                key={f._id}
                className="relative flex flex-col rounded border p-3 text-sm"
              >
                {isImage(f.fileOriginalName) ? (
                  <img
                    src={url}
                    alt={f.fileOriginalName}
                    className="h-16 w-full object-cover rounded mb-2"
                  />
                ) : (
                  <div className="flex h-32 w-full items-center justify-center rounded bg-gray-50 text-xs text-gray-500 mb-2">
                    {f.fileOriginalName.split(".").pop().toUpperCase()}
                  </div>
                )}

                <span className="truncate">{f.fileOriginalName}</span>

                <div className="absolute right-1 top-1 flex gap-1">
                  <button
                    onClick={() => window.open(url)}
                    title="Download"
                    className="p-1 rounded hover:bg-gray-100"
                  >
                    <FiDownload />
                  </button>
                  <button
                    onClick={() => handleDelete(f._id)}
                    title="Delete"
                    className="p-1 rounded hover:bg-gray-100"
                  >
                    {busyId === f._id ? (
                      <FiLoader className="animate-spin" />
                    ) : (
                      <FiTrash2 />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <ul className="divide-y border rounded">
          {files.map((f) => {
            const url = `${BASE}${f.fileUrl}`;
            return (
              <li
                key={f._id}
                className="flex items-center gap-3 rounded px-2 py-1 hover:bg-gray-50"
              >
                {isImage(f.fileOriginalName) ? (
                  <img
                    src={url}
                    alt={f.fileOriginalName}
                    className="h-9 w-9 rounded object-cover"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded bg-gray-100 text-[10px]">
                    {f.fileOriginalName.split(".").pop().toUpperCase()}
                  </div>
                )}

                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 truncate text-blue-600 hover:underline"
                >
                  {f.fileOriginalName}
                </a>

                <button
                  onClick={() => window.open(url)}
                  className="p-1 rounded hover:bg-gray-100"
                  title="Download"
                >
                  <FiDownload />
                </button>
                <button
                  onClick={() => handleDelete(f._id)}
                  className="p-1 rounded hover:bg-gray-100"
                  title="Delete"
                >
                  {busyId === f._id ? (
                    <FiLoader className="animate-spin" />
                  ) : (
                    <FiTrash2 />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
