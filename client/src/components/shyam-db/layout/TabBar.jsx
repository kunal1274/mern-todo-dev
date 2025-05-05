import { FiX } from "react-icons/fi";
import { useTabs } from "../../../context/shyam-db/TabManager.jsx";

export default function TabBar() {
  const { tabs, active, closeTab, switchTab } = useTabs();
  if (!tabs.length) return null;

  return (
    <div className="flex shrink-0 overflow-x-auto border-b bg-white">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => switchTab(t.id)}
          onAuxClick={(e) => e.button === 1 && closeTab(t.id)}
          className={`group flex items-center gap-2 whitespace-nowrap px-4 py-2 text-sm ${
            t.id === active
              ? "border-b-2 border-brand-600 bg-brand-50"
              : "hover:bg-gray-50"
          }`}
        >
          {t.icon && <t.icon className="text-xs" />}
          {t.title}
          <FiX
            onClick={(e) => {
              e.stopPropagation();
              closeTab(t.id);
            }}
            className="invisible text-xs group-hover:visible"
          />
        </button>
      ))}
    </div>
  );
}
