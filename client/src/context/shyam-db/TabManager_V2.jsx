import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { v4 as uuid } from "uuid";
import { useLocation, useNavigate } from "react-router-dom";

const TabCtx = createContext(null);

export const TabManagerProvider = ({ children }) => {
  const nav = useNavigate();
  const [tabs, setTabs] = useState([]); // [{id,title,path,icon}]
  const [active, setActive] = useState(null);

  /* open or focus ---------------------------------------------------- */
  const openTab = useCallback(
    ({ title, path, icon }) => {
      const hit = tabs.find((t) => t.path === path);
      if (hit) {
        setActive(hit.id);
        nav(hit.path);
        return hit.id;
      }
      const t = { id: uuid(), title, path, icon };
      setTabs((arr) => [...arr, t]);
      setActive(t.id);
      nav(path);
      return t.id;
    },
    [tabs, nav]
  );

  const closeTab = (id) =>
    setTabs((arr) => {
      const idx = arr.findIndex((t) => t.id === id);
      if (idx === -1) return arr;
      const next = [...arr];
      next.splice(idx, 1);
      // if we just closed the active one – jump to neighbour or /
      if (id === active) {
        const pick = next[idx] || next[idx - 1];
        if (pick) {
          nav(pick.path);
          setActive(pick.id);
        } else {
          nav("/");
          setActive(null);
        }
      }
      return next;
    });

  const loc = useLocation();

  useEffect(() => {
    if (!active) return;
    setTabs((arr) =>
      arr.map((t) => (t.id === active ? { ...t, path: loc.pathname } : t))
    );
    // eslint‑disable‑next‑line react-hooks/exhaustive-deps
  }, [loc.pathname]);

  return (
    <TabCtx.Provider value={{ tabs, active, openTab, closeTab, setActive }}>
      {children}
    </TabCtx.Provider>
  );
};

export const useTabs = () => useContext(TabCtx);
