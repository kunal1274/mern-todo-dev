import { useState } from "react";
import { FiPlus, FiArchive, FiRefreshCw } from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import useSites from "../../../hooks/shyam-db/useSites";
import SiteModal from "../../../components/shyam-db/inventory/SiteModal";
import LinkTab from "../../../components/shyam-db/layout/LinkTab";

export default function SiteList() {
  const { sites, loading, refresh, create, update, remove, archive } =
    useSites();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const save = (data) => {
    const fn = editing ? update(editing._id, data) : create(data);
    fn.then(() => {
      toast.success("Saved");
      refresh();
      setModalOpen(false);
    });
  };

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Sites</h2>
        <div className="flex gap-2">
          <button onClick={refresh} className="btn-secondary">
            <FiRefreshCw />
            Refresh
          </button>
          <button
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
            className="btn-primary"
          >
            <FiPlus />
            New
          </button>
        </div>
      </div>

      {/* table */}
      <div className="rounded border bg-white overflow-auto">
        <table className="min-w-full divide-y text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Code</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-left">Active</th>
              <th className="px-4 py-2 w-24"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-6 text-center">
                  Loading...
                </td>
              </tr>
            ) : sites.length ? (
              sites.map((s) => (
                <tr key={s._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <LinkTab to={`/sites/${s._id}`}>{s.code}</LinkTab>
                  </td>
                  <td className="px-4 py-2">{s.name}</td>
                  <td className="px-4 py-2">{s.type}</td>
                  <td className="px-4 py-2">{s.active ? "Yes" : "No"}</td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => {
                        setEditing(s);
                        setModalOpen(true);
                      }}
                      className="text-brand-600 hover:underline mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => archive(s._id, !s.archived).then(refresh)}
                      className="text-gray-400 hover:text-brand-600"
                    >
                      <FiArchive />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-6 text-center">
                  No data.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* modal */}
      <SiteModal
        open={modalOpen}
        initial={editing || {}}
        onClose={() => setModalOpen(false)}
        onSubmit={save}
      />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </section>
  );
}

/* tailwind utility buttons */
const btnBase =
  "inline-flex items-center gap-1 rounded border px-3 py-1.5 text-sm";
const Btn = (extra) => `${btnBase} ${extra}`;
const btnPrimary = Btn("bg-brand-600 text-white hover:bg-brand-500");
const btnSecondary = Btn("hover:bg-gray-50");
export { btnPrimary, btnSecondary };
