import { FiFile, FiDownload, FiTrash2 } from "react-icons/fi";

const API_URL =
  import.meta.env.VITE_BACKEND_API_URL_ERP || "http://localhost:5050/bb/api/v3";

export default function FileGallery({
  entity,
  parentId,
  files = [],
  onDelete,
}) {
  if (files.length === 0) {
    return <p className="text-sm text-gray-500">No attachments.</p>;
  }

  return (
    <div className="mt-4">
      <h4 className="mb-2 font-semibold">Attachments ({files.length})</h4>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {files.map((f) => {
          //   const url = `${API_URL}${f.fileUrl}`;
          const url = `${import.meta.env.VITE_BACKEND_API_URL_ERP}${f.fileUrl}`;
          const isImage = f.fileType.startsWith("image/");

          return (
            <div key={f._id} className="relative group border rounded p-3">
              {isImage ? (
                <img
                  src={url}
                  alt={f.fileName}
                  className="h-24 w-full object-cover rounded"
                />
              ) : (
                <FiFile className="text-4xl text-gray-400 mx-auto" />
              )}

              <div className="mt-2 text-sm truncate">{f.fileName}</div>

              {/* overlay icons */}
              <div className="absolute top-1 right-1 flex space-x-1 opacity-0 group-hover:opacity-100">
                <a
                  href={url}
                  download
                  className="p-1 bg-white rounded hover:bg-gray-100"
                  title="Download"
                >
                  <FiDownload className="text-gray-600" />
                </a>
                <button
                  onClick={() => onDelete(f._id)}
                  className="p-1 bg-white rounded hover:bg-gray-100"
                  title="Remove"
                >
                  <FiTrash2 className="text-red-600" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
