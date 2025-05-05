// components/inventory/ModuleRow.jsx
import { FiStar, FiStar as FiStarFill, FiChevronRight } from "react-icons/fi";
import { useFav } from "./ModuleCard"; // same custom hook

export default function ModuleRow({ item }) {
  const { fav, toggle } = useFav(item.k);

  return (
    <a
      href={item.href || "#"}
      className="group flex items-center gap-3 rounded px-3 py-2 hover:bg-gray-50"
    >
      {item.icon && <item.icon className="shrink-0 text-base text-brand-600" />}
      <div className="flex-1 text-sm">
        <span className="font-medium">{item.label}</span>
        {item.desc && (
          <span className="ml-2 text-xs text-gray-400">{item.desc}</span>
        )}
      </div>

      {/* favourite toggle */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          toggle();
        }}
        className="text-brand-600"
      >
        {fav ? <FiStarFill /> : <FiStar />}
      </button>

      <FiChevronRight className="text-gray-300 group-hover:translate-x-1 transition" />
    </a>
  );
}
