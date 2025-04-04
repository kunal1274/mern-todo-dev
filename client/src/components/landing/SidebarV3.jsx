// src/components/Sidebar.jsx

import React, { useState } from "react";
import {
  FaChevronUp,
  FaTachometerAlt,
  FaCog,
  FaCube,
  FaBars,
  FaCalendarCheck,
  FaTerminal,
  FaAngleUp,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuthDetailed } from "../../context/AuthContextDetailed";

function Sidebar() {
  // CHANGED: Tracks whether sidebar is collapsed
  const [collapsed, setCollapsed] = useState(false);

  const navigate = useNavigate();
  const { logout } = useAuthDetailed();

  // (Optional) If you ever want to map menu items, keep this array:
  const menuItems = [
    { icon: <FaCalendarCheck />, label: "Events" },
    { icon: <FaCog />, label: "Settings" },
    { icon: <FaCube />, label: "Environment" },
    { icon: <FaTerminal />, label: "Shell" },
    { icon: <FaAngleUp />, label: "Scaling" },
    // ... etc.
  ];

  return (
    // CHANGED: Apply conditional width classes and a transition for a smooth effect
    <div
      className={`border-r border-gray-200 bg-white flex flex-col text-sm
        ${collapsed ? "w-16" : "w-60"}
        transition-all duration-300`}
    >
      {/* Top section with brand and toggle button */}
      <div className="px-4 py-3 border-b border-gray-200 flex flex-row">
        <>
          <div className="font-semibold text-purple-600 border-r px-2">
            Ratxen
          </div>
          <div className="font-semibold text-purple-600 px-2">My Workspace</div>
        </>
        {/* Toggle button (now functional) */}
        <button
          className="text-gray-500 hover:text-gray-700 ml-auto"
          onClick={() => {
            // CHANGED: Actually toggle the collapsed state
            setCollapsed(!collapsed);
          }}
        >
          <FaBars />
        </button>
      </div>

      {/* Project name or environment info */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="text-gray-900 font-medium">fms-dev</div>
        <div className="text-xs text-gray-400">Node / Free</div>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 overflow-y-hidden hover:overflow-y-auto transition-all duration-300">
        <ul>
          <li>
            <a
              href="#events"
              className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-gray-700"
            >
              <FaTachometerAlt size={16} />
              Events
            </a>
          </li>
          <li>
            <a
              href="#settings"
              className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-gray-700"
            >
              <FaCog size={16} />
              Settings
            </a>
          </li>
          <li>
            <a
              href="#environment"
              className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-gray-700"
            >
              <FaCube size={16} />
              Environment
            </a>
          </li>
          <li>
            <a
              href="#shell"
              className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-gray-700"
            >
              <FaCog size={16} />
              Shell
            </a>
          </li>
          <li>
            <a
              href="#scaling"
              className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-gray-700"
            >
              <FaChevronUp size={16} />
              Scaling
            </a>
          </li>
          <li>
            <a
              href="#scaling"
              className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-gray-700"
            >
              <FaChevronUp size={16} />
              Previews
            </a>
          </li>
          {/* ... Repeat for all other items ... */}
          <li>
            <a
              href="#scaling"
              className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-gray-700"
            >
              <FaChevronUp size={16} />
              Extensions
            </a>
          </li>
        </ul>
      </nav>

      {/* Help / Sign out section */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="text-gray-900 font-medium space-y-4">Help ?</div>
        <div
          onClick={() => {
            logout();
            navigate("/");
          }}
          className="text-xs text-gray-400 cursor-pointer hover:text-purple-700"
        >
          Sign out
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
