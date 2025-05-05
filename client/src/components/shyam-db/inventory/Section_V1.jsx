// components/inventory/Section.jsx
import { useState } from "react";
import ModuleCard from "./ModuleCard";
import ModuleRow from "./ModuleRow";

export default function Section({ title, items, mode }) {
  const [open, setOpen] = useState(true);

  const Content = mode === "grid" ? ModuleCard : ModuleRow;
  const wrapClass =
    mode === "grid"
      ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      : "divide-y border rounded";

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="mb-4 flex w-full items-center justify-between text-sm font-semibold uppercase tracking-wide text-gray-400"
      >
        {title}
        <span>{open ? "–" : "+"}</span>
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
