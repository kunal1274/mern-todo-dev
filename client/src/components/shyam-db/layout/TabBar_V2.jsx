// src/components/TabBar.jsx
import { FiX } from "react-icons/fi";
import { useTabs } from "../../../context/shyam-db/TabManager";
import { useNavigate } from "react-router-dom";

export default function TabBar() {
  const { tabs, active, setActive, closeTab } = useTabs();
  const nav = useNavigate();

  if (!tabs.length) return null;

  return (
    <div className="flex h-9 shrink-0 items-center gap-0.5 border-b bg-white px-2">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => {
            setActive(t.id);
            nav(t.path); // 🔹 navigate to that tab’s route
          }}
          className={`flex items-center gap-2 rounded-t px-3 text-xs
            ${
              t.id === active
                ? "bg-brand-50 text-brand-700"
                : "hover:bg-gray-100"
            }`}
        >
          {t.icon && <t.icon className="text-[10px]" />}
          <span>{t.title}</span>
          <FiX
            className="ml-1 inline cursor-pointer text-[10px] hover:text-red-500"
            onClick={(e) => {
              e.stopPropagation();
              closeTab(t.id);
            }}
          />
        </button>
      ))}
    </div>
  );
}
