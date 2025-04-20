import {
  FiMenu,
  FiSearch,
  FiChevronDown,
  FiSettings,
  FiBell,
  FiUser,
  FiGift,
} from "react-icons/fi";

export default function TopbarCrystal({ toggleSidebar }) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b bg-white px-6">
      {/* burger */}
      <button onClick={toggleSidebar} className="p-2 rounded hover:bg-gray-100">
        <FiMenu className="text-xl" />
      </button>

      {/* search */}
      <div className="relative flex-1 max-w-xs">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="w-full rounded-lg bg-gray-100 pl-10 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-600"
          placeholder="Search here"
        />
      </div>

      {/* right menu */}
      <nav className="hidden md:flex items-center gap-6 ml-auto text-sm font-medium">
        <div className="flex items-center gap-1 cursor-pointer">
          Invoice <FiChevronDown />
        </div>
        <div className="flex items-center gap-1 cursor-pointer">
          Add <FiChevronDown />
        </div>
        <div className="flex items-center gap-1 cursor-pointer">
          Accounts <FiChevronDown />
        </div>
      </nav>

      {/* icons */}
      <div className="flex items-center gap-3 ml-auto md:ml-0">
        <button className="rounded p-2 hover:bg-gray-100">
          <FiSettings />
        </button>
        <button className="rounded p-2 hover:bg-gray-100">
          <FiBell />
        </button>
        <button className="rounded-lg border px-3 py-1 hover:bg-gray-50 text-xs flex items-center gap-2">
          <FiGift className="text-sm" />
          Refer & Earn
        </button>
        <button className="rounded-full bg-gray-200 p-2">
          <FiUser />
        </button>
      </div>
    </header>
  );
}

// {/*<header className="fixed top-0 inset-x-0 z-30 flex h-16 items-center gap-4 border-b bg-white px-6">*/}
