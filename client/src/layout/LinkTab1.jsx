import { useTabs } from "../context/TabManager/TabManager.jsx";
import { useLocation } from "react-router-dom";

export default function LinkTab({ to, title, icon: Icon, children, ...rest }) {
  const { openTab } = useTabs();
  const loc = useLocation();

  const handle = (e) => {
    const isMiddle = e.button === 1;
    const isNew = e.ctrlKey || e.metaKey || isMiddle;
    if (isNew) {
      e.preventDefault();
      openTab({ title, path: to, icon: Icon });
    }
  };

  return (
    <a
      href={to}
      onClick={(e) => {
        if (e.ctrlKey || e.metaKey) {
          handle(e);
        }
      }}
      onAuxClick={handle} // middle‑click
      className={
        loc.pathname === to
          ? "flex items-center gap-2 rounded bg-brand-50 px-3 py-1.5 font-medium text-brand-700"
          : "flex items-center gap-2 rounded px-3 py-1.5 hover:bg-gray-50"
      }
      {...rest}
    >
      {Icon && <Icon className="text-xs" />}
      {children}
    </a>
  );
}
