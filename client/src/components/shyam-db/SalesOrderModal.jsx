import { Dialog, Tab, Combobox } from "@headlessui/react";
import { FiX, FiChevronDown } from "react-icons/fi";
import { useState, useEffect, Fragment } from "react";
import useLookups from "../../hooks/shyam-db/useLookUps.js";
import dayjs from "dayjs";

/* ---------- helpers ---------- */
const empty = {
  customer: null,
  item: null,
  quantity: 1,
  price: 0,
  discount: 0,
  charges: 0,
  tax: 0,
  withholdingTax: 0,
  paymentTerms: "Net30D",
  remarks: "",
};

export default function SalesOrderModal({
  open,
  initial = {},
  onClose,
  onSubmit,
}) {
  const [openCust, setOpenCust] = useState(false);
  const [openItem, setOpenItem] = useState(false);

  const [form, setForm] = useState({ ...empty, ...initial });
  const { cust, item } = useLookups();

  /* reset when opening */
  useEffect(() => {
    if (open) setForm({ ...empty, ...initial });
  }, [open]);

  /* tiny utilities */
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  /* customer combobox filter */
  const [qCust, setQCust] = useState("");
  const custFiltered =
    qCust === ""
      ? cust
      : cust.filter((c) =>
          (c.name + c.code).toLowerCase().includes(qCust.toLowerCase())
        );

  const [qItem, setQItem] = useState("");
  const itemFiltered =
    qItem === ""
      ? item
      : item.filter((i) =>
          (i.name + i.code).toLowerCase().includes(qItem.toLowerCase())
        );

  const ok = form.customer && form.item && form.quantity > 0 && form.price >= 0;

  return (
    <Dialog open={open} onClose={onClose} className="relative z-[60]">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-2xl rounded-lg bg-white shadow">
          {/* header */}
          <div className="flex items-center justify-between border-b px-6 py-4">
            <Dialog.Title className="text-lg font-semibold">
              {initial._id ? "Edit Sales Order" : "New Sales Order"}
            </Dialog.Title>
            <button
              onClick={() => {
                onClose();
                setQCust("");
                setQItem("");
                setOpenCust(false);
                setOpenItem(false);
              }}
            >
              <FiX className="text-xl" />
            </button>
          </div>

          {/* TABS */}
          <Tab.Group>
            <Tab.List className="flex border-b text-sm">
              {["General", "Customer", "Item", "Others"].map((t) => (
                <Tab key={t} as={Fragment}>
                  {({ selected }) => (
                    <button
                      className={`px-4 py-2 ${
                        selected
                          ? "border-b-2 border-brand-600 font-medium"
                          : "text-gray-500"
                      }`}
                    >
                      {t}
                    </button>
                  )}
                </Tab>
              ))}
            </Tab.List>

            <Tab.Panels className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* ------------ General ------------ */}
              <Tab.Panel>
                <div className="grid grid-cols-2 gap-4">
                  <label className="text-sm">
                    Quantity
                    <input
                      type="number"
                      min="0"
                      value={form.quantity}
                      onChange={(e) => set("quantity")(Number(e.target.value))}
                      className="mt-1 w-full rounded border px-2 py-1"
                    />
                  </label>
                  <label className="text-sm">
                    Price
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={(e) => set("price")(Number(e.target.value))}
                      className="mt-1 w-full rounded border px-2 py-1"
                    />
                  </label>
                  <label className="text-sm">
                    Discount %
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.discount}
                      onChange={(e) => set("discount")(Number(e.target.value))}
                      className="mt-1 w-full rounded border px-2 py-1"
                    />
                  </label>
                  <label className="text-sm">
                    Charges
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.charges}
                      onChange={(e) => set("charges")(Number(e.target.value))}
                      className="mt-1 w-full rounded border px-2 py-1"
                    />
                  </label>
                </div>
              </Tab.Panel>

              {/* ------------ Customer ------------ */}
              <Tab.Panel>
                {/* <Combobox value={form.customer} onChange={set("customer")}> */}
                <Combobox
                  as="div"
                  value={form.customer}
                  onChange={(v) => {
                    set("customer")(v);
                    setOpenCust(false);
                  }}
                  open={openCust}
                  by="_id"
                >
                  <Combobox.Input
                    displayValue={(c) => c?.name || ""}
                    onChange={(e) => {
                      setQCust(e.target.value);
                      setOpenCust(true);
                    }}
                    className="w-full rounded border px-3 py-2 pr-8"
                    placeholder="Search customer..."
                  />
                  <FiChevronDown
                    className="relative -ml-6 inline text-gray-400 cursor-pointer"
                    onClick={() => setOpenCust((o) => !o)}
                  />
                  <Combobox.Options
                    static={openCust === true}
                    className="mt-1 max-h-64 w-full overflow-y-auto rounded border bg-white shadow"
                  >
                    {custFiltered.map((c) => (
                      <Combobox.Option
                        key={c._id}
                        value={c}
                        className="cursor-pointer px-3 py-1 hover:bg-brand-50"
                      >
                        {c.name}{" "}
                        <span className="text-xs text-gray-500">
                          ({c.code}) 📞 {c.contactNum}📧 {c.email}
                        </span>
                      </Combobox.Option>
                    ))}
                    {!custFiltered.length && (
                      <div className="px-3 py-2 text-xs text-gray-500">
                        No match.
                      </div>
                    )}
                  </Combobox.Options>
                </Combobox>
              </Tab.Panel>

              {/* ------------ Item ------------ */}
              <Tab.Panel>
                <Combobox
                  as="div"
                  open={openItem}
                  value={form.item}
                  // onChange={set("item")}
                  onChange={(v) => {
                    set("item")(v);
                    setOpenItem(false);
                  }}
                  by="_id"
                >
                  <Combobox.Input
                    displayValue={(i) => i?.name || ""}
                    //onChange={(e) => setQItem(e.target.value)}
                    onChange={(e) => {
                      setQItem(e.target.value);
                      setOpenItem(true);
                    }}
                    className="w-full rounded border px-3 py-2 pr-8"
                    placeholder="Search item..."
                  />
                  <FiChevronDown
                    className="relative -ml-6 inline text-gray-400 cursor-pointer"
                    onClick={() => {
                      //console.log("item button dd clicke", openItem);

                      setOpenItem((i) => !i);
                      //console.log("after click", openItem);
                    }}
                  />

                  <Combobox.Options
                    static={openItem === true}
                    className="mt-1 max-h-64 w-full overflow-y-auto rounded border bg-white shadow"
                  >
                    {itemFiltered.map((i) => (
                      <Combobox.Option
                        key={i._id}
                        value={i}
                        className="cursor-pointer px-3 py-1 hover:bg-brand-50"
                      >
                        {i.name}{" "}
                        <span className="text-xs text-gray-500">
                          ({i.code}) ₨ {i.price} per {i.unit}
                        </span>
                      </Combobox.Option>
                    ))}
                    {!itemFiltered.length && (
                      <div className="px-3 py-2 text-xs text-gray-500">
                        No match.
                      </div>
                    )}
                  </Combobox.Options>
                </Combobox>
              </Tab.Panel>

              {/* ------------ Others ------------ */}
              <Tab.Panel>
                <label className="text-sm">
                  Payment Terms
                  <select
                    className="mt-1 w-full rounded border px-2 py-1"
                    value={form.paymentTerms}
                    onChange={(e) => set("paymentTerms")(e.target.value)}
                  >
                    {[
                      "COD",
                      "Net7D",
                      "Net15D",
                      "Net30D",
                      "Net45D",
                      "Net60D",
                      "Net90D",
                      "Advance",
                    ].map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </label>
                <label className="mt-4 block text-sm">
                  Remarks
                  <textarea
                    rows={3}
                    className="mt-1 w-full rounded border px-3 py-2"
                    value={form.remarks}
                    onChange={(e) => set("remarks")(e.target.value)}
                  />
                </label>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>

          {/* footer */}
          <div className="border-t px-6 py-4 text-right">
            <button
              disabled={!ok}
              onClick={() =>
                onSubmit({
                  customer: form.customer._id,
                  item: form.item._id,
                  ...form,
                })
              }
              className={`rounded px-4 py-2 text-white ${
                ok ? "bg-brand-600 hover:bg-brand-500" : "bg-gray-300"
              }`}
            >
              {initial._id ? "Save" : "Create"}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
