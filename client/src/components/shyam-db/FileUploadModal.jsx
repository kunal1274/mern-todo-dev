import { Dialog } from "@headlessui/react";
import { FiX } from "react-icons/fi";
import { useState } from "react";

export default function FileUploadModal({ open, onClose, onUpload }) {
  const [files, setFiles] = useState([]);
  const ok = files.length > 0;

  return (
    <Dialog open={open} onClose={onClose} className="relative z-[70]">
      <div className="fixed inset-0 bg-black/40" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md rounded bg-white shadow">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <Dialog.Title className="text-lg font-semibold">
              Upload files
            </Dialog.Title>
            <button onClick={onClose}>
              <FiX />
            </button>
          </div>

          <div className="p-6 space-y-4 text-sm">
            <input
              type="file"
              multiple
              onChange={(e) => setFiles(e.target.files)}
            />
            {files.length > 0 && (
              <ul className="list-disc ml-5">
                {[...files].map((f) => (
                  <li key={f.name}>{f.name}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t px-6 py-4 text-right">
            <button
              disabled={!ok}
              onClick={() => onUpload(files)}
              className={`rounded px-4 py-1.5 text-white ${
                ok ? "bg-brand-600 hover:bg-brand-500" : "bg-gray-300"
              }`}
            >
              Upload
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
