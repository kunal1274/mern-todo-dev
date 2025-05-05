import { Dialog } from "@headlessui/react";
import { FiX, FiUpload } from "react-icons/fi";
import { useState, Fragment } from "react";
import clsx from "clsx";

/* ------------------------------------------------------------------
   SettingsModal.jsx  –  full‑screen modal with sidebar navigation
   ------------------------------------------------------------------ */

export default function SettingsModal({ open, onClose, onSave, initial = {} }) {
  /* ------------ local state -------------------------------------- */
  const [tab, setTab] = useState("business");
  const [profile, setProfile] = useState({
    businessName: "",
    logo: null, // File object (optional)
    contact: "",
    fiscalYear: "",
    industry: "",
    ...initial.profile,
  });
  const [prefs, setPrefs] = useState({
    // main modules
    billOfSupply: true,
    estimates: false,
    salesOrders: true,
    deliveryChallans: true,
    purchaseOrders: true,
    retainerInvoices: false,
    recurringExpense: false,
    recurringBills: false,
    recurringJournals: true,
    creditNote: true,
    paymentLinks: false,
    tasks: false,
    // inventory add‑ons
    itemGroups: true,
    compositeItems: true,
    packages: false,
    picklists: false,
    shipments: false,
    purchaseReceive: false,
    salesReturns: false,
    ...initial.preferences,
  });

  /* ------------ helpers ------------------------------------------ */
  const NAV = [
    { key: "business", label: "Business Profile" },
    { key: "prefs", label: "Preferences" },
    // future: e‑Way, Templates …
  ];

  function saveChanges() {
    onSave({ profile, preferences: prefs });
  }

  /* ------------ render ------------------------------------------- */
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" />

      <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
        <Dialog.Panel className="w-full max-w-4xl rounded-lg bg-white shadow-xl">
          {/* header */}
          <div className="flex items-center justify-between border-b px-6 py-4 sticky top-0 bg-white z-10">
            <h3 className="text-lg font-semibold">Settings</h3>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
              <FiX className="text-xl" />
            </button>
          </div>

          {/* body grid */}
          <div className="grid grid-cols-[200px_1fr]" style={{ minHeight: "60vh" }}>
            {/* sidebar */}
            <aside className="border-r py-4">
              {NAV.map((n) => (
                <button
                  key={n.key}
                  onClick={() => setTab(n.key)}
                  className={clsx(
                    "block w-full px-6 py-2 text-left text-sm",
                    tab === n.key ? "bg-brand-50 font-medium" : "hover:bg-gray-50"
                  )}
                >
                  {n.label}
                </button>
              ))}
            </aside>

            {/* panel */}
            <main className="p-8 overflow-y-auto">
              {tab === "business" && (
                <BusinessForm value={profile} onChange={setProfile} />
              )}
              {tab === "prefs" && (
                <PreferencesForm value={prefs} onChange={setPrefs} />
              )}
            </main>
          </div>

          {/* footer */}
          <div className="border-t px-6 py-4 text-right sticky bottom-0 bg-white">
            <button
              onClick={saveChanges}
              className="rounded bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500"
            >
              Save Changes
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

/* ------------------------------------------------------------------
   <BusinessForm />
   ------------------------------------------------------------------ */
function BusinessForm({ value, onChange }) {
  const update = (k, v) => onChange({ ...value, [k]: v });
  return (
    <section>
      <h4 className="text-xl font-medium mb-1">Business Profile</h4>
      <p className="text-xs text-gray-500 mb-6">
        Pretend not to be evil meow to be let out intently stare at the same.
      </p>

      <label className="block text-sm mb-4">
        Business Name
        <input
          type="text"
          placeholder="Ex. ABC Pvt. Ltd."
          value={value.businessName}
          onChange={(e) => update("businessName", e.target.value)}
          className="mt-1 w-full rounded border px-3 py-2"
        />
      </label>

      {/* logo uploader */}
      <div className="mb-4">
        <label className="block text-sm mb-1">Business Logo</label>
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded bg-gray-100 flex items-center justify-center text-xs text-gray-400">
            {value.logo ? (
              <img src={URL.createObjectURL(value.logo)} alt="logo" className="h-full w-full object-cover rounded" />
            ) : (
              "Logo"
            )}
          </div>
          <label className="inline-flex items-center gap-1 rounded border px-3 py-1 text-xs hover:bg-gray-50 cursor-pointer">
            <FiUpload /> Change
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => update("logo", e.target.files[0])}
            />
          </label>
          {value.logo && (
            <button
              onClick={() => update("logo", null)}
              className="text-xs text-red-600 underline"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      <label className="block text-sm mb-4">
        Primary Contact No.
        <input
          type="tel"
          placeholder="+91 …"
          value={value.contact}
          onChange={(e) => update("contact", e.target.value)}
          className="mt-1 w-full rounded border px-3 py-2"
        />
      </label>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <label className="text-sm">
          Fiscal Year
          <select
            value={value.fiscalYear}
            onChange={(e) => update("fiscalYear", e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
          >
            <option value="">Select Option</option>
            {Array.from({ length: 5 }).map((_, i) => {
              const yr = 2024 - i;
              return (
                <option key={yr}>{`${yr}-${yr + 1}`}</option>
              );
            })}
          </select>
        </label>
        <label className="text-sm">
          Industry
          <select
            value={value.industry}
            onChange={(e) => update("industry", e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
          >
            <option value="">Select Option</option>
            {[
              "Manufacturing",
              "Trading",
              "Services",
              "IT/Software",
              "Others",
            ].map((it) => (
              <option key={it}>{it}</option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------
   <PreferencesForm />
   ------------------------------------------------------------------ */
const MODULES_LEFT = [
  { key: "billOfSupply", label: "Bill of Supply" },
  { key: "estimates", label: "Estimates" },
  { key: "salesOrders", label: "Sales Orders" },
  { key: "deliveryChallans", label: "Delivery Challans" },
  { key: "purchaseOrders", label: "Purchase Orders" },
  { key: "retainerInvoices", label: "Retainer Invoices" },
];
const MODULES_RIGHT = [
  { key: "recurringExpense", label: "Recurring Expense" },
  { key: "recurringBills", label: "Recurring Bills" },
  { key: "recurringJournals", label: "Recurring Journals" },
  { key: "creditNote", label: "Credit Note" },
  { key: "paymentLinks", label: "Payment Links" },
  { key: "tasks", label: "Tasks" },
];
const INVENTORY_ADDONS = [
  { key: "itemGroups", label: "Item groups" },
  { key: "compositeItems", label: "Composite Items" },
  { key: "packages", label: "Packages" },
  { key: "picklists", label: "Picklists" },
  { key: "shipments", label: "Shipments" },
  { key: "purchaseReceive", label: "Purchase Receive" },
  { key: "salesReturns", label: "Sales Returns" },
];

function PreferencesForm({ value, onChange }) {
  const toggle = (k) => onChange({ ...value, [k]: !value[k] });
  return (
    <section>
      <h4 className="text-xl font-medium mb-1">Preferences</h4>
      <p className="text-xs text-gray-500 mb-6">
        Pretend not to be evil meow to be let out intently stare at the same.
      </p>

      <p className="text-sm font-medium mb-2">Select the modules you would like to enable.</p>
      <div className="grid grid-cols-2 gap-x-10 gap-y-1 mb-6">
        {[MODULES_LEFT, MODULES_RIGHT].map((COL, idx) => (
          <div key={idx}>
            {COL.map((m) => (
              <label key={m.key} className="flex items-center gap-2 text-sm mb-1">
                <input
                  type="checkbox"
                  checked={!!value[m.key]}
                  onChange={() => toggle(m.key)}
                />
                {m.label}
              </label>
            ))}
          </div>
        ))}
      </div>

      {/* inventory add‑ons */}
      <p className="text-sm font-medium mb-3">Inventory Add‑on</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {INVENTORY_ADDONS.map((a) => (
          <div
            key={a.key}
            className="rounded border p-3 text-sm hover:shadow-sm transition"
          >
            <div className="flex items-center justify-between mb-1">
              <span>{a.label}</span>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={!!value[a.key]}
                  onChange={() => toggle(a.key)}
                />
                <span
                  className={clsx(
                    "h-4 w-7 rounded-full transition bg-gray-300 relative",
                    value[a.key] && "bg-brand-600"
                  )}
                >
                  <span
                    className={clsx(
                      "absolute top-0.5 left-0.5 h-3 w-3 rounded-full bg-white shadow transform transition",
                      value[a.key] && "translate-x-3"
                    )}
                  />
                </span>
              </label>
            </div>
            <p className="text-xs text-gray-500 leading-4">
              Pretend not to be evil meow to be let out intently stare at the same.
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
