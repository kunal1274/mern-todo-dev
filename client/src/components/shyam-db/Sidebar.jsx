import { FiMenu, FiCircle, FiColumns, FiHome } from "react-icons/fi";

const sections = [
  { title: "Sales", items: 3 },
  { title: "Purchase", items: 10 },
  { title: "Items", items: 5 },
  { title: "Others", items: 6 },
];

function SidebarCrystal1({ isOpen }) {
  return (
    <aside
      className={`${
        isOpen ? "w-64" : "w-0"
      } shrink-0 transition-all duration-300  border-r bg-white`}
    >
      <div className="flex items-center px-4 py-5 gap-2">
        <FiMenu className="text-xl" />
        {/* logo */}
        <FiColumns className="text-2xl text-brand-600" />
        <div>
          <h1 className="text-lg font-semibold leading-tight">Crystal</h1>
          <p className="text-xs text-gray-400 -mt-1">SaaS Platform</p>
        </div>
      </div>

      {/* nav list */}
      <nav className="px-4 overflow-y-auto space-y-5">
        {sections.map(({ title, items }) => (
          <div key={title}>
            <h3 className="mb-2 mt-4 text-xs font-medium uppercase text-gray-400">
              {title}
            </h3>

            {[...Array(items)].map((_, i) => (
              <a
                href="#"
                key={i}
                className="group flex items-center gap-2 py-1.5 pl-1 text-sm rounded hover:bg-gray-100"
              >
                <FiCircle className="text-xs text-gray-400 group-hover:text-brand-600" />
                <span>Menu Item</span>
              </a>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}

export default function SidebarCrystal({ isOpen, toggleSidebar }) {
  return (
    <aside
      className={`${
        isOpen ? "w-64" : "w-14"
      } transition-all duration-300 border-r bg-white flex flex-col h-full`}
    >
      {/* ── logo + hamburger (pinned) ─────────── */}
      <div className="sticky top-0 z-10 flex items-center gap-2 h-16 px-4 border-b bg-white">
        {/* <button
          onClick={toggleSidebar}
          className="p-2 rounded hover:bg-gray-100"
        >
          <FiMenu className="text-xl" />
        </button> */}
        <FiColumns className="text-2xl text-brand-600" />

        {/* hide logo text while collapsed */}
        {isOpen && (
          <>
            <div>
              <h1 className="text-lg font-semibold leading-tight">
                Business Book
              </h1>
              <p className="text-xs text-gray-400 -mt-0.5">
                Writing Your Business
              </p>
            </div>
          </>
        )}
      </div>

      {/* ── scrolling menu list ────────────────── */}
      <nav className="flex-1 overflow-y-auto px-4 space-y-5">
        {sections.map(({ title, items }) => (
          <div key={title}>
            {isOpen && (
              <h3 className="mb-2 mt-4 text-xs font-medium uppercase text-gray-400">
                {title}
              </h3>
            )}

            {[...Array(items)].map((_, i) => (
              <a
                href="#"
                key={i}
                className="group flex items-center gap-2 py-1.5 pl-1 text-sm rounded hover:bg-gray-100"
              >
                <FiHome className="text-xs text-gray-400 group-hover:text-brand-600" />
                {isOpen && <span>Menu Item</span>}
              </a>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}
