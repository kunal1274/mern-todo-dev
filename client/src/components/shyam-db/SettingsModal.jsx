import { Dialog, Transition, Tab } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import { FiX, FiPlus, FiTrash2 } from "react-icons/fi";

/**
 * SettingsModal.jsx  ▸  full‑screen modal that hosts all settings tabs
 * Tabs delivered so far ►  Business Profile ▸ User ▸ Preferences
 *
 * Props
 * ──────────────────────────────────────────
 * • open   – boolean
 * • onClose() – close handler
 * • onSave(payload) – consolidated save (profile, users, prefs)
 */
export default function SettingsModal({ open, onClose, onSave }) {
  /* ---------------- state buckets ---------------- */
  const [selectedTab, setSelectedTab] = useState("Business Profile");

  // business profile
  const [profile, setProfile] = useState({
    name: "",
    logo: "", // base64 string for now
    phone: "",
    fiscalYear: "",
    industry: "",
  });

  // users CRUD (local only – wire to API later)
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "Admin",
      email: "admin@corp.io",
      role: "Admin",
      active: true,
    },
    {
      id: 2,
      name: "John Doe",
      email: "john@corp.io",
      role: "Sales",
      active: true,
    },
  ]);
  const [editing, setEditing] = useState(null); // user that’s open in the editor panel

  // preferences (checkbox matrix & add‑on toggles)
  const [prefs, setPrefs] = useState({
    core: {
      billOfSupply: true,
      estimates: false,
      salesOrders: true,
      deliveryChallans: true,
      purchaseOrders: true,
      retainerInvoices: false,
      recurringExpense: false,
      recurringBills: false,
      recurringJournals: true,
      creditNotes: true,
      paymentLinks: false,
      tasks: false,
    },
    addons: {
      itemGroups: true,
      compositeItems: true,
      packages: false,
      picklists: false,
      shipments: true,
      purchaseReceive: false,
      salesReturns: true,
    },
  });

  const [eWay, setEWay] = useState({
    ewayUser: "",
    ewayPass: "",
    ewayAuto: false,
    ewayMode: "Road",
    ewayKm: 0,
  });
  const [gst, setGst] = useState({
    gstin: "",
    gstRegType: "Regular",
    placeOfSupply: "27‑Maharashtra",
    defaultHsn: "",
    revCharge: false,
  });

  const [template, setTemplate] = useState({
    templates: {},
    autoSeal: false,
  });

  const [notification, setNotification] = useState({ pushEnabled: false });
  const [reminder, setReminder] = useState({
    remPay: false,
    remPayWhen: false,
    remPayChan: false,
  });

  const [databackup, setDataBackup] = useState({
    backupEnabled: false,
    backupFreq: {},
  });
  const [subscription, setSubscription] = useState({
    plan: {},
    autoRenew: false,
  });
  const [addon, setAddon] = useState({ addOns: {} });

  /* reset form when reopened */
  useEffect(() => {
    if (!open) return; // do nothing on close
    setSelectedTab("Business Profile");
    // we could fetch real data here e.g. getSettings()
  }, [open]);

  /* ---------------- helpers ---------------- */
  const sidebarBtns = [
    "Business Profile",
    "User",
    "Preferences",
    "e‑Way",
    "GST",
    "Templates",
    "Notifications",
    "Reminders",
    "Data backup",
    "Subscription",
    "Add‑ons",
  ];

  const saveAll = () => {
    onSave?.({ profile, users, prefs });
  };

  /* ============================== RENDER ============================== */
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* overlay */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40" />
        </Transition.Child>

        {/* panel */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-5xl h-[90vh] overflow-hidden rounded-lg bg-white shadow-xl">
              {/* header sticky */}
              <div className="flex items-center justify-between border-b px-6 py-3 sticky top-0 bg-white z-10">
                <h3 className="text-lg font-semibold">Settings</h3>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <FiX />
                </button>
              </div>

              <div className="flex h-full">
                {/* -------- sidebar -------- */}
                <aside className="w-52 border-r pt-4 overflow-y-auto">
                  {sidebarBtns.map((b) => (
                    <button
                      key={b}
                      onClick={() => setSelectedTab(b)}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                        selectedTab === b
                          ? "font-medium text-brand-700 bg-gray-100"
                          : "text-gray-700"
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </aside>

                {/* -------- content scroll area -------- */}
                <main className="flex-1 overflow-y-auto p-6">
                  {selectedTab === "Business Profile" && (
                    <BusinessProfileTab state={profile} setState={setProfile} />
                  )}

                  {selectedTab === "User" && (
                    <UserTab
                      users={users}
                      setUsers={setUsers}
                      editing={editing}
                      setEditing={setEditing}
                    />
                  )}

                  {selectedTab === "Preferences" && (
                    <PreferencesTab prefs={prefs} setPrefs={setPrefs} />
                  )}

                  {selectedTab === "e‑Way" && (
                    <EWayTab state={eWay} set={setEWay} />
                  )}
                  {selectedTab === "GST" && <GSTTab state={gst} set={setGst} />}
                  {selectedTab === "Templates" && (
                    <TemplatesTab state={template} set={setTemplate} />
                  )}
                  {selectedTab === "Notifications" && (
                    <NotificationsTab
                      state={notification}
                      set={setNotification}
                    />
                  )}
                  {selectedTab === "Reminders" && (
                    <RemindersTab state={reminder} set={setReminder} />
                  )}
                  {selectedTab === "Data backup" && (
                    <DataBackupTab state={databackup} set={setDataBackup} />
                  )}
                  {selectedTab === "Subscription" && (
                    <SubscriptionTab
                      state={subscription}
                      set={setSubscription}
                    />
                  )}
                  {selectedTab === "Add‑ons" && (
                    <AddOnsTab state={addon} set={setAddon} />
                  )}
                </main>
              </div>

              {/* footer sticky */}
              <div className="flex justify-end gap-2 border-t px-6 py-3 sticky bottom-0 bg-white">
                <button
                  onClick={onClose}
                  className="rounded border px-4 py-2 text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={saveAll}
                  className="rounded bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500"
                >
                  Save Changes
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}

/* ====================================================================
       Business‑Profile TAB
==================================================================== */
function BusinessProfileTab({ state, setState }) {
  const bind = (k) => (e) => setState({ ...state, [k]: e.target.value });

  /* file → base64 */
  const pickLogo = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setState({ ...state, logo: ev.target.result });
    reader.readAsDataURL(file);
  };

  return (
    <section className="space-y-4 max-w-lg">
      <h4 className="text-xl font-semibold">Business Profile</h4>
      <p className="text-xs text-gray-500 max-w-sm">
        Pretend not to be evil meow to be let out intently stare at the same.
      </p>

      <label className="block text-sm">
        Business Name
        <input
          value={state.name}
          onChange={bind("name")}
          className="mt-1 w-full rounded border px-3 py-2"
          placeholder="Ex. ABC Pvt. Ltd."
        />
      </label>

      {/* logo */}
      <div>
        <span className="block text-sm mb-1">Business Logo</span>
        {state.logo ? (
          <img
            src={state.logo}
            alt="logo"
            className="w-20 h-20 object-cover rounded"
          />
        ) : (
          <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
            100×100
          </div>
        )}
        <div className="mt-2 flex gap-2 text-xs">
          <label className="underline cursor-pointer text-brand-600">
            Change
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={pickLogo}
            />
          </label>
          {state.logo && (
            <button
              onClick={() => setState({ ...state, logo: "" })}
              className="underline text-red-600"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      <label className="block text-sm">
        Primary Contact No.
        <input
          value={state.phone}
          onChange={bind("phone")}
          className="mt-1 w-full rounded border px-3 py-2"
          placeholder="+91 | Ex. 99999 99999"
        />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="block text-sm">
          Fiscal Year
          <select
            value={state.fiscalYear}
            onChange={bind("fiscalYear")}
            className="mt-1 w-full rounded border px-3 py-2"
          >
            <option value="">Select option</option>
            {[
              "Apr 2024 – Mar 2025",
              "Apr 2023 – Mar 2024",
              "Jan 2024 – Dec 2024",
            ].map((fy) => (
              <option key={fy}>{fy}</option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          Industry
          <select
            value={state.industry}
            onChange={bind("industry")}
            className="mt-1 w-full rounded border px-3 py-2"
          >
            <option value="">Select option</option>
            {["Manufacturing", "Trading", "IT Services", "Retail"].map(
              (ind) => (
                <option key={ind}>{ind}</option>
              )
            )}
          </select>
        </label>
      </div>
    </section>
  );
}

/* ====================================================================
       USER TAB
==================================================================== */
function UserTab({ users, setUsers, editing, setEditing }) {
  const blank = { id: null, name: "", email: "", role: "Viewer", active: true };

  const startAdd = () => setEditing({ ...blank, id: Date.now() });

  const saveUser = () => {
    setUsers((prev) => {
      const idx = prev.findIndex((u) => u.id === editing.id);
      if (idx === -1) return [...prev, editing];
      const cloned = [...prev];
      cloned[idx] = editing;
      return cloned;
    });
    setEditing(null);
  };

  const remove = (u) => setUsers((prev) => prev.filter((x) => x.id !== u.id));

  return (
    <div className="flex gap-6 h-full">
      {/* list */}
      <div className="w-56 border-r pr-4">
        <div className="flex items-center justify-between mb-2 text-sm font-medium">
          Users
          <button
            onClick={startAdd}
            className="text-brand-600 hover:text-brand-700"
          >
            <FiPlus />
          </button>
        </div>
        <ul className="space-y-1 text-sm max-h-[60vh] overflow-y-auto pr-1">
          {users.map((u) => (
            <li key={u.id} className="flex items-center justify-between group">
              <button
                onClick={() => setEditing(u)}
                className={`flex-1 text-left px-2 py-1 rounded hover:bg-gray-50 ${
                  editing?.id === u.id ? "bg-brand-50 text-brand-700" : ""
                }`}
              >
                {u.name}
              </button>
              <button
                onClick={() => remove(u)}
                className="invisible group-hover:visible text-red-500 px-1"
              >
                <FiTrash2 />
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* editor */}
      {editing ? (
        <div className="flex-1 max-w-md space-y-4">
          <h4 className="text-lg font-medium">
            {editing.id ? "Edit" : "New"} User
          </h4>
          <label className="block text-sm">
            Name
            <input
              value={editing.name}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              className="mt-1 w-full rounded border px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            Email
            <input
              type="email"
              value={editing.email}
              onChange={(e) =>
                setEditing({ ...editing, email: e.target.value })
              }
              className="mt-1 w-full rounded border px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            Role
            <select
              value={editing.role}
              onChange={(e) => setEditing({ ...editing, role: e.target.value })}
              className="mt-1 w-full rounded border px-3 py-2"
            >
              {["Admin", "Sales", "Accounts", "Viewer"].map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={editing.active}
              onChange={(e) =>
                setEditing({ ...editing, active: e.target.checked })
              }
            />
            Active
          </label>
          <div className="pt-2">
            <button
              onClick={saveUser}
              className="rounded bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500"
            >
              Save User
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500">
          Select a user on the left or press + to add.
        </p>
      )}
    </div>
  );
}

/* ====================================================================
       PREFERENCES TAB
==================================================================== */
function PreferencesTab({ prefs, setPrefs }) {
  const toggle = (sec, key) =>
    setPrefs((p) => ({ ...p, [sec]: { ...p[sec], [key]: !p[sec][key] } }));

  /* cell renderer */
  const Check = ({ sec, k, label }) => (
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={prefs[sec][k]}
        onChange={() => toggle(sec, k)}
      />
      {label}
    </label>
  );

  /* custom toggle for add‑ons */
  const ToggleCard = ({ id, title }) => (
    <div className="rounded border p-3 text-sm">
      <div className="flex items-center justify-between">
        <span className="font-medium">{title}</span>
        <label className="inline-flex items-center cursor-pointer">
          <span className="sr-only">toggle</span>
          <span
            className={`h-3.5 w-7 rounded-full transition-colors ${
              prefs.addons[id] ? "bg-brand-600" : "bg-gray-300"
            }`}
            onClick={() => toggle("addons", id)}
          >
            <span
              className={`block h-3 w-3 rounded-full bg-white shadow transform transition-transform ${
                prefs.addons[id] ? "translate-x-3.5" : "translate-x-0.5"
              }`}
            />
          </span>
        </label>
      </div>
      <p className="mt-1 text-xs text-gray-500">
        Pretend not to be evil meow to be let out intently stare at the same.
      </p>
    </div>
  );

  return (
    <section className="space-y-6 pb-20">
      {/* padding bottom for scroll under footer */}
      <h4 className="text-xl font-semibold">Preferences</h4>
      <p className="text-xs text-gray-500 max-w-sm">
        Select the modules you would like to enable.
      </p>

      {/* core module matrix */}
      <div className="grid grid-cols-2 gap-y-2 max-w-lg">
        <Check sec="core" k="billOfSupply" label="Bill of Supply" />
        <Check sec="core" k="recurringExpense" label="Recurring Expense" />
        <Check sec="core" k="estimates" label="Estimates" />
        <Check sec="core" k="recurringBills" label="Recurring Bills" />
        <Check sec="core" k="salesOrders" label="Sales Orders" />
        <Check sec="core" k="recurringJournals" label="Recurring Journals" />
        <Check sec="core" k="deliveryChallans" label="Delivery Challans" />
        <Check sec="core" k="creditNotes" label="Credit Note" />
        <Check sec="core" k="purchaseOrders" label="Purchase Orders" />
        <Check sec="core" k="paymentLinks" label="Payment Links" />
        <Check sec="core" k="retainerInvoices" label="Retainer Invoices" />
        <Check sec="core" k="tasks" label="Tasks" />
        <Check sec="core" k="recurringInvoice" label="Recurring Invoice" />
      </div>

      {/* inventory add‑ons */}
      <h5 className="mt-6 font-medium">Inventory Add‑on</h5>
      <div className="grid grid-cols-3 gap-4 max-w-3xl text-sm">
        <ToggleCard id="itemGroups" title="Item groups" />
        <ToggleCard id="compositeItems" title="Composite Items" />
        <ToggleCard id="packages" title="Packages" />
        <ToggleCard id="picklists" title="Picklists" />
        <ToggleCard id="shipments" title="Shipments" />
        <ToggleCard id="purchaseReceive" title="Purchase Receive" />
        <ToggleCard id="salesReturns" title="Sales Returns" />
      </div>
    </section>
  );
}

// components/settings/tabs/EWayTab.jsx
// import { Toggle } from "../ui/Toggle";
// import Select from "../ui/Select";

export function EWayTab({ state, set }) {
  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold">e‑Way Settings</h3>

      <label className="block text-sm">
        API Username
        <input
          className="mt-1 w-full rounded border px-3 py-2"
          value={state.ewayUser || ""}
          onChange={(e) => set("ewayUser", e.target.value)}
        />
      </label>

      <label className="block text-sm">
        API Password / Key
        <input
          type="password"
          className="mt-1 w-full rounded border px-3 py-2"
          value={state.ewayPass || ""}
          onChange={(e) => set("ewayPass", e.target.value)}
        />
      </label>

      <Toggle
        label="Auto‑generate e‑Way bill on shipment post"
        value={state.ewayAuto || false}
        onChange={(v) => set("ewayAuto", v)}
      />

      <Select
        label="Default mode of transport"
        options={["Road", "Air", "Rail", "Ship"]}
        value={state.ewayMode || "Road"}
        onChange={(v) => set("ewayMode", v)}
      />

      <label className="block text-sm">
        Default distance (km)
        <input
          type="number"
          className="mt-1 w-full rounded border px-3 py-2"
          value={state.ewayKm || ""}
          onChange={(e) => set("ewayKm", +e.target.value)}
        />
      </label>
    </section>
  );
}

export function GSTTab({ state, set }) {
  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold">GST Profile</h3>

      <label className="block text-sm">
        GSTIN
        <input
          className="mt-1 w-full rounded border px-3 py-2 tracking-widest"
          maxLength={15}
          value={state.gstin || ""}
          onChange={(e) => set("gstin", e.target.value.toUpperCase())}
        />
      </label>

      <Select
        label="Registration type"
        options={[
          "Regular",
          "Composition",
          "SEZ Unit",
          "SEZ Developer",
          "Un‑registered",
        ]}
        value={state.gstRegType || "Regular"}
        onChange={(v) => set("gstRegType", v)}
      />

      <Select
        label="Place of supply (default)"
        options={[
          "01‑J&K",
          "02‑HP",
          "03‑Punjab",
          "07‑Delhi",
          "27‑Maharashtra",
          // … add as needed
        ]}
        value={state.placeOfSupply || "27‑Maharashtra"}
        onChange={(v) => set("placeOfSupply", v)}
      />

      <label className="block text-sm">
        Default HSN/SAC
        <input
          className="mt-1 w-full rounded border px-3 py-2"
          value={state.defaultHsn || ""}
          onChange={(e) => set("defaultHsn", e.target.value)}
        />
      </label>

      <Toggle
        label="Reverse‑charge by default"
        value={state.revCharge || false}
        onChange={(v) => set("revCharge", v)}
      />
    </section>
  );
}

export function TemplatesTab({ state, set }) {
  const docs = ["Invoice", "Delivery Challan", "Sales Order", "Purchase Bill"];

  return (
    <section className="space-y-6">
      <h3 className="text-lg font-semibold">Document Templates</h3>

      {docs.map((d) => (
        <Select
          key={d}
          label={`${d} template`}
          options={["Classic", "Modern", "Compact", "Custom"]}
          value={state.templates?.[d] || "Classic"}
          onChange={(v) => set("templates", { ...state.templates, [d]: v })}
        />
      ))}

      <Toggle
        label="Attach company seal automatically"
        value={state.autoSeal || false}
        onChange={(v) => set("autoSeal", v)}
      />
    </section>
  );
}

// components/settings/tabs/NotificationsTab.jsx

export function NotificationsTab({ state, set }) {
  const events = [
    ["notifyShip", "When order is shipped"],
    ["notifyDeliver", "When order is delivered"],
    ["notifyInvoice", "When invoice is generated"],
    ["notifyPayment", "When payment is received"],
  ];

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold">Notifications</h3>

      {events.map(([k, lbl]) => (
        <Toggle
          key={k}
          label={lbl}
          value={state[k] || false}
          onChange={(v) => set(k, v)}
        />
      ))}

      <Toggle
        label="Send push notifications (mobile app)"
        value={state.pushEnabled || false}
        onChange={(v) => set("pushEnabled", v)}
      />
    </section>
  );
}

// components/settings/tabs/RemindersTab.jsx

export function RemindersTab({ state, set }) {
  return (
    <section className="space-y-6">
      <h3 className="text-lg font-semibold">Automated Reminders</h3>

      <Toggle
        label="Enable payment‑due reminders"
        value={state.remPay || false}
        onChange={(v) => set("remPay", v)}
      />

      {state.remPay && (
        <>
          <Select
            label="Send reminder"
            options={["1 day before", "On due date", "3 days after"]}
            value={state.remPayWhen || "1 day before"}
            onChange={(v) => set("remPayWhen", v)}
          />
          <Select
            label="Channel"
            options={["Email only", "Email + SMS"]}
            value={state.remPayChan || "Email only"}
            onChange={(v) => set("remPayChan", v)}
          />
        </>
      )}

      <Toggle
        label="Weekly backup to email"
        value={state.backupWeekly || false}
        onChange={(v) => set("backupWeekly", v)}
      />
    </section>
  );
}

export function DataBackupTab({ state, set }) {
  return (
    <section className="space-y-6">
      <h3 className="text-lg font-semibold">Data Backup</h3>

      <Toggle
        label="Enable automatic backup"
        value={state.backupEnabled || false}
        onChange={(v) => set("backupEnabled", v)}
      />

      {state.backupEnabled && (
        <Select
          label="Frequency"
          options={["Daily", "Weekly", "Monthly"]}
          value={state.backupFreq || "Weekly"}
          onChange={(v) => set("backupFreq", v)}
        />
      )}

      <button
        onClick={() => alert("↧  Generating .zip (stub)…")}
        className="rounded bg-brand-600 px-3 py-1.5 text-sm text-white hover:bg-brand-500"
      >
        Download latest backup now
      </button>

      <label className="block text-sm">
        Restore from file (.zip)
        <input
          type="file"
          accept=".zip"
          onChange={(e) => alert(`↥  ${e.target.files[0]?.name} chosen (stub)`)}
          className="mt-2 block w-full cursor-pointer rounded border px-3 py-2 text-sm"
        />
      </label>
    </section>
  );
}

export function SubscriptionTab({ state, set }) {
  return (
    <section className="space-y-6">
      <h3 className="text-lg font-semibold">Subscription</h3>

      <Select
        label="Current plan"
        options={["Free", "Standard", "Pro", "Enterprise"]}
        value={state.plan || "Free"}
        onChange={(v) => set("plan", v)}
      />

      <Toggle
        label="Auto‑renew on expiry"
        value={state.autoRenew || false}
        onChange={(v) => set("autoRenew", v)}
      />

      {state.plan !== "Free" && (
        <button
          onClick={() => alert("Redirect to billing portal (stub)…")}
          className="rounded border px-3 py-1.5 text-sm hover:bg-gray-50"
        >
          Manage billing details
        </button>
      )}
    </section>
  );
}

const CATALOG = [
  { k: "picklists", label: "Picklists", price: "$5/mo" },
  { k: "composite", label: "Composite Items", price: "$7/mo" },
  { k: "packages", label: "Packages", price: "$4/mo" },
  { k: "shipmods", label: "Advanced Shipments", price: "$6/mo" },
  { k: "analytics", label: "AI Analytics", price: "$9/mo" },
];

export function AddOnsTab({ state, set }) {
  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold">Add‑ons marketplace</h3>

      {CATALOG.map((a) => (
        <Toggle
          key={a.k}
          label={`${a.label} – ${a.price}`}
          value={state.addOns?.[a.k] || false}
          onChange={(v) => set("addOns", { ...state.addOns, [a.k]: v })}
        />
      ))}
    </section>
  );
}

// components/settings/ui/Toggle.jsx
export function Toggle1({ label, value, onChange }) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded border px-3 py-2 text-sm">
      <span>{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`relative h-5 w-10 rounded-full transition-colors ${
          value ? "bg-brand-600" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
            value ? "translate-x-5" : "translate-x-1"
          }`}
        />
      </button>
    </label>
  );
}

// components/settings/ui/Toggle.jsx
export function Toggle({ label, value, onChange }) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded border px-3 py-2 text-sm">
      <span>{label}</span>
      {/* NOTE:   `type="button"` avoids implicit form‑submit & keeps focus styles */}
      <button
        type="button"
        aria-pressed={value}
        onClick={() => onChange(!value)}
        className={`relative h-5 w-10 rounded-full transition-colors ${
          value ? "bg-brand-600" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
            value ? "translate-x-5" : "translate-x-1"
          }`}
        />
      </button>
    </label>
  );
}

export function Toggle3({ checked, onChange }) {
  return (
    <label className="inline-flex cursor-pointer items-center">
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="h-4 w-7 rounded-full bg-gray-300 peer-checked:bg-brand-600 transition-all relative">
        <span className="absolute left-0.5 top-0.5 h-3 w-3 rounded-full bg-white peer-checked:translate-x-3 transition" />
      </span>
    </label>
  );
}

// components/settings/ui/Select.jsx
export function Select({ label, options, value, onChange }) {
  return (
    <label className="block text-sm">
      {label}
      <select
        className="mt-1 w-full rounded border px-3 py-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
