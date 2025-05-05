import { useState } from "react";
import {
  FiGrid,
  FiHeart,
  FiList,
  FiFileText,
  FiClock,
  FiTool,
  FiRepeat,
  FiLayers,
  FiLayout,
  FiColumns,
  FiChevronDown,
  FiChevronUp,
  FiAirplay,
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
    { k: "set_site", label: "Site Master", icon: FiAirplay },
    { k: "set_serial", label: "Serial Tracking", icon: FiTool },
  ],
  journals: [
    { k: "jnl_count", label: "Counting Journal", icon: FiRepeat },
    { k: "jnl_transfer", label: "Transfer Journal", icon: FiRepeat },
  ],
};

export default function InventoryLanding() {
  const [mode, setMode] = useState("grid"); // grid | list | hier | masonry | modular
  const [allOpen, setAllOpen] = useState(true); // collapse / expand everything

  // refresh favourites every render
  CATALOG.favourites = Object.values(CATALOG)
    .flat()
    .filter((x) => localStorage.getItem(`fav_inv_${x.k}`) === "1");

  /* helper for toolbar icons */
  const BTN = ({ val, Icon, tip }) => (
    <button
      onClick={() => setMode(val)}
      className={`rounded p-1.5 ${
        mode === val ? "bg-brand-600 text-white" : "hover:bg-gray-100"
      }`}
      title={tip}
    >
      <Icon />
    </button>
  );

  return (
    <main className="flex-1 overflow-y-auto p-8">
      {/* ── toolbar ───────────────────────────────────────────── */}
      <header className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-semibold">Inventory Management</h1>

        <div className="flex items-center gap-2">
          {/* view‑mode buttons */}
          <BTN val="grid" Icon={FiGrid} tip="Cards (Grid)" />
          <BTN val="list" Icon={FiList} tip="Compact List" />
          <BTN val="hier" Icon={FiLayers} tip="Hierarchy" />
          <BTN val="masonry" Icon={FiLayout} tip="Masonry" />
          <BTN val="modular" Icon={FiColumns} tip="Modular" />

          {/* collapse / expand */}
          <button
            onClick={() => setAllOpen((p) => !p)}
            title={allOpen ? "Collapse all" : "Expand all"}
            className="ml-4 inline-flex items-center gap-1 rounded border px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            {allOpen ? <FiChevronUp /> : <FiChevronDown />}
            {allOpen ? "Collapse" : "Expand"}
          </button>
        </div>
      </header>

      {/* ── content sections ─────────────────────────────────── */}
      <div className="space-y-10">
        <Section
          title="User Workspaces"
          items={CATALOG.workspaces}
          mode={mode}
          globalOpen={allOpen}
        />
        <Section
          title="Favourites"
          items={CATALOG.favourites}
          mode={mode}
          globalOpen={allOpen}
        />
        <Section
          title="General / Common"
          items={CATALOG.common}
          mode={mode}
          globalOpen={allOpen}
        />
        <Section
          title="Inquiries & Reports"
          items={CATALOG.reports}
          mode={mode}
          globalOpen={allOpen}
        />
        <Section
          title="Periodic Tasks"
          items={CATALOG.periodic}
          mode={mode}
          globalOpen={allOpen}
        />
        <Section
          title="Set‑ups & Configuration"
          items={CATALOG.setups}
          mode={mode}
          globalOpen={allOpen}
        />
        <Section
          title="Inventory Journals"
          items={CATALOG.journals}
          mode={mode}
          globalOpen={allOpen}
        />
      </div>
    </main>
  );
}
