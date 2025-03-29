import React, { useState } from "react";
import {
  FaBars,
  FaCalendarCheck,
  FaCog,
  FaCube,
  FaTerminal,
  FaAngleUp,
  FaRegLifeRing,
  FaSignOutAlt,
} from "react-icons/fa";

/**
 * Example collapsible sidebar:
 * - Collapsed:  `w-16` (icons only)
 * - Expanded:   `w-60` (icons + text)
 * - Overflow hidden by default, shows scroll on hover
 */

function Sidebar() {
  // Tracks whether sidebar is collapsed
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { icon: <FaCalendarCheck />, label: "Events" },
    { icon: <FaCog />, label: "Settings" },
    { icon: <FaCube />, label: "Environment" },
    { icon: <FaTerminal />, label: "Shell" },
    { icon: <FaAngleUp />, label: "Scaling" },
    { icon: <FaAngleUp />, label: "Previews" },
    { icon: <FaAngleUp />, label: "Disks" },
    { icon: <FaAngleUp />, label: "Jobs" },
    { icon: <FaAngleUp />, label: "Start Apps" },
    { icon: <FaAngleUp />, label: "Weather" },
    { icon: <FaAngleUp />, label: "Queue" },
    { icon: <FaAngleUp />, label: "Previews" },
    { icon: <FaAngleUp />, label: "Disks" },
    { icon: <FaAngleUp />, label: "Jobs" },
    { icon: <FaAngleUp />, label: "Start Apps" },
    { icon: <FaAngleUp />, label: "Weather" },
    { icon: <FaAngleUp />, label: "Queue" },
    { icon: <FaAngleUp />, label: "Jobs" },
    { icon: <FaAngleUp />, label: "Start Apps" },
    { icon: <FaAngleUp />, label: "Weather" },
    { icon: <FaAngleUp />, label: "Queue" },
    { icon: <FaAngleUp />, label: "Previews" },
    { icon: <FaAngleUp />, label: "Disks" },
    { icon: <FaAngleUp />, label: "Jobs" },
    { icon: <FaAngleUp />, label: "Start Apps" },
    { icon: <FaAngleUp />, label: "Weather" },
    { icon: <FaAngleUp />, label: "Queue" },
  ];

  return (
    <>
      <div className="flex flex-col text-sm">
        <div className="px-4 py-3 border-b border-gray-200 flex flex-row">
          {collapsed ? (
            <h1>Rx</h1>
          ) : (
            <>
              <div className="font-semibold text-purple-600 border-r px-2">
                Ratxen
              </div>
              <div className="font-semibold text-purple-600 px-2">
                My Workspace
              </div>
            </>
          )}
        </div>
        <div
          className={`
        flex flex-col h-screen border-r border-gray-200 bg-white
        ${collapsed ? "w-16" : "w-60"}
        overflow-y-hidden hover:overflow-y-auto
        transition-all duration-300
      `}
        >
          {/* Top section (Project name / Toggle button) */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200">
            {/* Show or hide text depending on collapsed */}
            {!collapsed && (
              <div>
                <div className="font-semibold text-gray-800">fms-dev</div>
                <div className="text-xs text-gray-400">Node / Free</div>
              </div>
            )}
            {/* Toggle button (always visible) */}
            <button
              className="text-gray-500 hover:text-gray-700 ml-auto"
              onClick={() => setCollapsed(!collapsed)}
            >
              <FaBars />
            </button>
          </div>

          {/* Menu items */}
          <nav className="flex-1">
            {menuItems.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 py-2 px-3 text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                <span className="text-lg">{item.icon}</span>
                {/* Label hidden if collapsed */}
                {!collapsed && <span className="text-sm">{item.label}</span>}
              </div>
            ))}
          </nav>
        </div>
        {/* Bottom "Help" and "Sign out" */}
        <div className="p-3 border-t border-gray-200">
          {!collapsed ? (
            <div className="text-sm text-gray-600">
              <div className="mb-2">Help ?</div>
              <div className="flex items-center gap-2 text-red-600 hover:text-red-800 cursor-pointer">
                <FaSignOutAlt />
                <span>Sign out</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center text-gray-500">
              <FaRegLifeRing className="mb-2" />
              <FaSignOutAlt className="text-red-600" />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Sidebar;
