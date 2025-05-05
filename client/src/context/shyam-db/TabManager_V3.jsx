// src/context/TabManager.jsx
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
  const loc = useLocation(); // 🔹  moved up
  const [tabs, setTabs] = useState([]); // [{id,title,path,icon}]
  const [active, setActive] = useState(null); // id of current tab

  /* ── open or focus a tab ─────────────────────────────────────────── */
  const openTab = useCallback(
    ({ title, path, icon }) => {
      /* 1️⃣ freeze current tab’s URL BEFORE we change active */
      setTabs((arr) =>
        arr.map((t) => (t.id === active ? { ...t, path: loc.pathname } : t))
      );

      /* 2️⃣ if a tab with same path already exists, just focus it */
      const hit = tabs.find((t) => t.path === path);
      //const hit = tabs.find((t) => t.base === path);
      if (hit) {
        setActive(hit.id);
        nav(hit.path);
        return hit.id;
      }

      /* 3️⃣ otherwise create a brand‑new tab */
      const t = { id: uuid(), title, path, icon };
      //const t = { id: uuid(), title, base: path, path, icon };
      setTabs((arr) => [...arr, t]);
      setActive(t.id);
      nav(path);
      return t.id;
    },
    [tabs, active, loc.pathname, nav] // 🔹  added active & pathname
  );

  /* ── close tab ───────────────────────────────────────────────────── */
  const closeTab = (id) =>
    setTabs((arr) => {
      const idx = arr.findIndex((t) => t.id === id);
      if (idx === -1) return arr;
      const next = [...arr];
      next.splice(idx, 1);

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

  /* ── keep active tab’s path fresh while you browse inside it ─────── */
  useEffect(() => {
    if (!active) return;
    setTabs((arr) =>
      arr.map((t) => (t.id === active ? { ...t, path: loc.pathname } : t))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loc.pathname, active]); // 🔹 added active

  /* 🔸 NEW — if navigation happens outside the TabBar, highlight the
     tab whose saved path matches the current URL. */
  // useEffect(() => {
  //   // const hit = tabs.find((t) => loc.pathname.startsWith(t.path));
  //   const hit = tabs.find((t) => loc.pathname.startsWith(t.base));
  //   if (hit && hit.id !== active) setActive(hit.id);
  // }, [loc.pathname, tabs, active]);

  return (
    <TabCtx.Provider value={{ tabs, active, openTab, closeTab, setActive }}>
      {children}
    </TabCtx.Provider>
  );
};

export const useTabs = () => useContext(TabCtx);
