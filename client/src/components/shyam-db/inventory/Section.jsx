import { useState, useEffect } from "react";
import ModuleCard from "./ModuleCard";
import ModuleRow from "./ModuleRow";

export default function Section({ title, items, mode, globalOpen }) {
  const [open, setOpen] = useState(true);

  /* sync with global collapse / expand */
  useEffect(() => setOpen(globalOpen), [globalOpen]);

  /* pick renderer & wrapper per mode */
  let Content = ModuleCard;
  let wrapClass = "grid gap-4 sm:grid-cols-2 lg:grid-cols-3";

  switch (mode) {
    case "list":
      Content = ModuleRow;
      wrapClass = "divide-y border rounded";
      break;
    case "hier":
      Content = ModuleRow;
      wrapClass = "flex flex-col ml-4 border-l space-y-1 pl-4";
      break;
    case "masonry":
      Content = (props) => <ModuleCard {...props} masonry />;
      wrapClass = "columns-2 lg:columns-3 gap-4";
      break;
    case "modular":
      Content = (props) => <ModuleCard {...props} large />;
      wrapClass = "space-y-4";
      break;
    default: /* grid */
  }

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="mb-4 flex w-full items-center justify-between text-sm font-semibold uppercase tracking-wide text-gray-400"
      >
        {title}
        <span className={`transition ${open ? "rotate-0" : "-rotate-90"}`}>
          ›
        </span>
      </button>

      {open && (
        <div className={wrapClass}>
          {items.map((it) => (
            <Content key={it.k} item={it} />
          ))}
        </div>
      )}
    </div>
  );
}
