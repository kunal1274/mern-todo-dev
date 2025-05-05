import { useState } from "react";
import {
  FiGrid,
  FiHeart,
  FiList,
  FiFileText,
  FiClock,
  FiTool,
  FiRepeat,
  FiLayout,
} from "react-icons/fi";
import ModuleCard from "./ModuleCard";
import Section from "./Section";

const CATALOG = {
  workspaces: [
    { k: "ws_dash", label: "My Dashboard", icon: FiGrid },
    { k: "ws_short", label: "Quick Stock Lookup", icon: FiList },
  ],
  favourites: [], // will be filled at runtime
  common: [
    { k: "itm_master", label: "Item Master", icon: FiTool },
    { k: "wh_master", label: "Warehouse Master", icon: FiTool },
  ],
  reports: [
    { k: "rpt_onhand", label: "On‑hand by Site", icon: FiFileText },
    { k: "rpt_trans", label: "Inventory Transactions", icon: FiFileText },
    { k: "rpt_custitem", label: "Customer by Item", icon: FiFileText },
  ],
  periodic: [
    { k: "prd_close", label: "Month‑end Close", icon: FiClock },
    { k: "prd_adjust", label: "Stock Adjustment Wizard", icon: FiClock },
  ],
  setups: [
    { k: "set_color", label: "Colour Codes", icon: FiTool },
    { k: "set_serial", label: "Serial Tracking", icon: FiTool },
  ],
  journals: [
    { k: "jnl_count", label: "Counting Journal", icon: FiRepeat },
    { k: "jnl_transfer", label: "Transfer Journal", icon: FiRepeat },
  ],
};

export default function InventoryLanding() {
  const [mode, setMode] = useState("grid"); // grid | list
  // rebuild favourites on every render
  CATALOG.favourites = Object.values(CATALOG)
    .flat()
    .filter((x) => localStorage.getItem(`fav_inv_${x.k}`) === "1");

  return (
    <main className="flex-1 overflow-y-auto p-8">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Inventory Management</h1>

        {/* view‑mode toggle */}
        <button
          onClick={() => setMode((m) => (m === "grid" ? "list" : "grid"))}
          className="flex items-center gap-1 rounded border px-3 py-1.5 text-sm hover:bg-gray-50"
          title="Toggle view"
        >
          {mode === "grid" ? <FiList /> : <FiLayout />} 
          {mode === "grid" ? "List" : "Cards"}
        </button>
      </header>

      <div className="space-y-10">
        <Section
          title="User Workspaces"
          items={CATALOG.workspaces}
          mode={mode}
        />
        <Section title="Favourites" items={CATALOG.favourites} mode={mode} />{" "}
        <Section title="General / Common" items={CATALOG.common} mode={mode} />{" "}
        <Section
          title="Inquiries & Reports"
          items={CATALOG.reports}
          mode={mode}
        />{" "}
        <Section title="Periodic Tasks" items={CATALOG.periodic} mode={mode} />{" "}
        <Section
          title="Set‑ups & Configuration"
          items={CATALOG.setups}
          mode={mode}
        />{" "}
        <Section
          title="Inventory Journals"
          items={CATALOG.journals}
          mode={mode}
        />
      </div>
    </main>
  );
}

export function InventoryLanding1() {
  const [mode, setMode] = useState("grid"); // grid | list
  // rebuild favourites on every render
  CATALOG.favourites = Object.values(CATALOG)
    .flat()
    .filter((x) => localStorage.getItem(`fav_inv_${x.k}`) === "1");

  return (
    <main className="flex-1 overflow-y-auto p-8">
      <h1 className="mb-8 text-2xl font-semibold">Inventory Management</h1>

      <div className="space-y-10">
        <Section title="User Workspaces" items={CATALOG.workspaces} />
        <Section title="Favourites" items={CATALOG.favourites} />
        <Section title="General / Common" items={CATALOG.common} />
        <Section title="Inquiries & Reports" items={CATALOG.reports} />
        <Section title="Periodic Tasks" items={CATALOG.periodic} />
        <Section title="Set‑ups & Configuration" items={CATALOG.setups} />
        <Section title="Inventory Journals" items={CATALOG.journals} />
      </div>
    </main>
  );
}

function Section1({ title, items }) {
  const [open, setOpen] = useState(true);
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((i) => (
            <ModuleCard key={i.k} item={i} />
          ))}
        </div>
      )}
    </div>
  );
}
