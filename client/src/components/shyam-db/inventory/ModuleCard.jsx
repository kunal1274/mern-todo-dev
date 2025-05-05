import { FiStar, FiStar as FiStarFill, FiArrowUpRight } from "react-icons/fi";
import { useState, useEffect } from "react";

export function useFav(k) {
  const key = `fav_inv_${k}`;
  const [fav, setFav] = useState(() => localStorage.getItem(key) === "1");
  const toggle = () => {
    const v = !fav;
    setFav(v);
    localStorage.setItem(key, v ? "1" : "0");
  };
  return { fav, toggle };
}

export function ModuleCard1({ item }) {
  // --- favourite flag in localStorage ----------------------------------

  const key = `fav_inv_${item.k}`;
  const [fav, setFav] = useState(() => localStorage.getItem(key) === "1");
  const toggle = () => {
    const v = !fav;
    setFav(v);
    localStorage.setItem(key, v ? "1" : "0");
  };
  // ---------------------------------------------------------------------

  return (
    <a
      href={item.href || "#"}
      className="group relative flex flex-col rounded-lg border bg-white p-4 transition-all hover:shadow-lg"
    >
      {/* star */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          toggle();
        }}
        className="absolute right-2 top-2 text-brand-600"
        title={fav ? "Un‑favourite" : "Add to favourites"}
      >
        {fav ? <FiStarFill /> : <FiStar />}
      </button>

      {/* icon */}
      {item.icon && (
        <item.icon className="mb-3 text-2xl text-brand-600 group-hover:scale-110 transition" />
      )}

      {/* label */}
      <h4 className="font-medium">{item.label}</h4>
      {item.desc && <p className="mt-0.5 text-xs text-gray-500">{item.desc}</p>}

      {/* subtle arrow */}
      <FiArrowUpRight className="absolute bottom-2 right-2 opacity-0 transition group-hover:opacity-100" />
    </a>
  );
}

export default function ModuleCard({ item, masonry = false, large = false }) {
  /* … existing favourite hook … */
  const key = `fav_inv_${item.k}`;
  const [fav, setFav] = useState(() => localStorage.getItem(key) === "1");
  const toggle = () => {
    const v = !fav;
    setFav(v);
    localStorage.setItem(key, v ? "1" : "0");
  };

  const baseClass =
    "group relative rounded-lg border bg-white p-4 transition hover:shadow-lg";
  const layout = large ? "flex items-center gap-4" : "flex flex-col";
  const masonryFix = masonry ? "break-inside-avoid" : "";

  return (
    <a
      href={item.href || "#"}
      className={`${baseClass} ${layout} ${masonryFix}`}
    >
      {/* star etc. unchanged */}
      {/* star */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          toggle();
        }}
        className="absolute right-2 top-2 text-brand-600"
        title={fav ? "Un‑favourite" : "Add to favourites"}
      >
        {fav ? <FiStarFill /> : <FiStar />}
      </button>

      {/* icon + text differ in large mode */}
      {item.icon && (
        <item.icon
          className={`text-brand-600 ${large ? "text-2xl" : "mb-3 text-2xl"}`}
        />
      )}
      <div className="flex-1">
        <h4 className="font-medium">{item.label}</h4>
        {item.desc && (
          <p className="mt-0.5 text-xs text-gray-500">{item.desc}</p>
        )}
      </div>
      {/* arrow unchanged */}
      {/* subtle arrow */}
      <FiArrowUpRight className="absolute bottom-2 right-2 opacity-0 transition group-hover:opacity-100" />
    </a>
  );
}

// components/settings/ui/Select.jsx
export function Select({ label, options = [], value, onChange }) {
  return (
    <label className="block text-sm">
      {label}
      <select
        className="mt-1 w-full rounded border px-3 py-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((op) => (
          <option key={op}>{op}</option>
        ))}
      </select>
    </label>
  );
}
