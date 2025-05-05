import { createContext, useContext, useState, useCallback } from "react";
import { v4 as uuid } from "uuid";
import { useNavigate } from "react-router-dom";

const TabContext = createContext();

export function TabManagerProvider({ children }) {
  const nav = useNavigate();
  const [tabs, setTabs] = useState([]);
  const [active, setActive] = useState(null);

  /* open OR focus -------------------------- */
  const openTab = useCallback(
    ({ title, path, icon }) => {
      const hit = tabs.find((t) => t.path === path);
      if (hit) {
        setActive(hit.id);
        nav(hit.path);
        return hit.id;
      }
      const tab = { id: uuid(), title, path, icon };
      setTabs((t) => [...t, tab]);
      setActive(tab.id);
      nav(path);
      return tab.id;
    },
    [tabs, nav]
  );

  const closeTab = (id) =>
    setTabs((t) => {
      const idx = t.findIndex((x) => x.id === id);
      if (idx === -1) return t;
      const next = [...t];
      next.splice(idx, 1);
      // activate neighbour if closed one is active
      if (id === active) {
        const pick = next[idx] || next[idx - 1];
        if (pick) {
          nav(pick.path);
          setActive(pick.id);
        } else {
          nav("/"); // fallback home
          setActive(null);
        }
      }
      return next;
    });

  return (
    <TabContext.Provider value={{ tabs, active, openTab, closeTab, setActive }}>
      {children}
    </TabContext.Provider>
  );
}

export const useTabs = () => useContext(TabContext);
