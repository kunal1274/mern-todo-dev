// src/context/TabManager.jsx
import { createContext, useContext, useState, useCallback } from "react";
import { v4 as uuid } from "uuid";
import { useNavigate } from "react-router-dom";

const TabCtx = createContext(null);

export const TabManagerProvider = ({ children }) => {
  const nav = useNavigate();
  const [tabs, setTabs] = useState([]); // [{id,title,path,icon}]
  const [active, setActive] = useState(null);

  /* ── open or focus a tab ──────────────────────────────────── */
  const openTab = useCallback(
    ({ title, path, icon }) => {
      // 1) if a tab with same path already exists, focus it
      const hit = tabs.find((t) => t.path === path);
      if (hit) {
        setActive(hit.id);
        nav(hit.path);
        return hit.id;
      }
      // 2) else create new tab
      const t = { id: uuid(), title, path, icon };
      setTabs((arr) => [...arr, t]);
      setActive(t.id);
      nav(path);
      return t.id;
    },
    [tabs, nav]
  );

  /* ── close tab ─────────────────────────────────────────────── */
  const closeTab = useCallback(
    (id) =>
      setTabs((arr) => {
        const idx = arr.findIndex((t) => t.id === id);
        if (idx === -1) return arr;
        const next = [...arr];
        next.splice(idx, 1);
        // if closed was active, pick neighbor
        if (id === active) {
          const pick = next[idx] || next[idx - 1];
          if (pick) {
            setActive(pick.id);
            nav(pick.path);
          } else {
            setActive(null);
            nav("/");
          }
        }
        return next;
      }),
    [active, nav]
  );

  /* ── switch active tab ────────────────────────────────────── */
  const switchTab = useCallback(
    (id) => {
      const t = tabs.find((x) => x.id === id);
      if (!t) return;
      setActive(id);
      nav(t.path);
    },
    [tabs, nav]
  );

  return (
    <TabCtx.Provider value={{ tabs, active, openTab, closeTab, switchTab }}>
      {children}
    </TabCtx.Provider>
  );
};

export const useTabs = () => useContext(TabCtx);
