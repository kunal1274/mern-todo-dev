import { FiX, FiUploadCloud } from "react-icons/fi";

import { toast } from "react-toastify";
import { useFileUpload } from "../../hooks/shyam-db/useFileUpload";
import { useState } from "react";

export default function FileUploadModal({ open, soId, onClose, onDone }) {
  const { upload, progress, busy } = useFileUpload();
  const [files, setFiles] = useState([]);

  if (!open) return null;

  const start = () => {
    upload("sales-orders", soId, files)
      .then((r) => {
        toast.success("Uploaded");
        onDone(r.data.data);
      })
      .catch((e) => toast.error(e.response?.data?.message || "Error"));
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between mb-4">
          <h4 className="text-lg font-medium">Attach files</h4>
          <button onClick={onClose}>
            <FiX />
          </button>
        </div>

        <input
          multiple
          type="file"
          onChange={(e) => setFiles(e.target.files)}
        />

        {busy && (
          <div className="mt-4 flex items-center gap-2 text-sm">
            <div className="h-2 flex-1 bg-gray-200 rounded">
              <div
                style={{ width: `${progress}%` }}
                className="h-2 bg-brand-600 rounded"
              />
            </div>
            {progress}%
          </div>
        )}

        <button
          disabled={!files.length || busy}
          onClick={start}
          className="mt-6 w-full flex items-center justify-center gap-2 rounded bg-brand-600 px-3 py-1.5 text-white disabled:opacity-40"
        >
          <FiUploadCloud />
          {busy ? "Uploading…" : "Upload"}
        </button>
      </div>
    </div>
  );
}
