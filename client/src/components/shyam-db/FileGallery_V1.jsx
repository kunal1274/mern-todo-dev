// components/files/FileGallery.jsx
import { FiFile, FiDownload } from "react-icons/fi";

export default function FileGallery({ files = [] }) {
  if (!files.length) return null;
  return (
    <div className="mt-8">
      <h4 className="mb-2 font-semibold">Attachments ({files.length})</h4>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {files.map((f) => (
          <a
            key={f.fileUrl}
            href={f.fileUrl}
            target="_blank"
            className="group relative flex items-center gap-3 rounded border p-3 hover:shadow"
          >
            {f.fileType.startsWith("image/") ? (
              <img
                src={f.fileUrl}
                alt={f.fileName}
                className="h-10 w-10 rounded object-cover"
              />
            ) : (
              <FiFile className="text-2xl text-brand-600" />
            )}
            <span className="flex-1 truncate text-sm">{f.fileName}</span>
            <FiDownload className="opacity-0 group-hover:opacity-100" />
          </a>
        ))}
      </div>
    </div>
  );
}
