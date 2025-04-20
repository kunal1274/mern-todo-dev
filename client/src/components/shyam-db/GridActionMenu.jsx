import { FiMoreVertical } from "react-icons/fi";
import { useState } from "react";

export default function GridActionMenu(props) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <FiMoreVertical
        className="cursor-pointer"
        onClick={() => setOpen((s) => !s)}
      />
      {open && (
        <div className="absolute right-0 top-4 z-20 w-32 divide-y rounded border bg-white text-sm shadow">
          <button
            onClick={props.onEdit}
            className="block w-full px-3 py-2 text-left hover:bg-gray-50"
          >
            Edit
          </button>
          <button
            onClick={props.onArchive}
            className="block w-full px-3 py-2 text-left hover:bg-gray-50"
          >
            {props.archived ? "Un‑archive" : "Archive"}
          </button>
          <button
            onClick={props.onProcess}
            className="block w-full px-3 py-2 text-left hover:bg-gray-50"
          >
            Process
          </button>
          <button
            onClick={props.onDelete}
            className="block w-full px-3 py-2 text-left text-red-600 hover:bg-gray-50"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
