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
// CHANGED: Additional icons if you want, or placeholders

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
    <div
      className={`w-60 border-r border-gray-200 bg-white flex flex-col text-sm ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      {/* ADDED: 'My Workspace' at the top */}

      <div className="px-4 py-3 border-b border-gray-200 flex flex-row">
        {!collapsed && (
          <>
            <div className="font-semibold text-purple-600 border-r px-2">
              Ratxen
            </div>
            <div className="font-semibold text-purple-600 px-2">
              My Workspace
            </div>
          </>
        )}
        {/* Toggle button (always visible) */}
        <button
          className="text-gray-500 hover:text-gray-700 ml-auto"
          onClick={() => {
            console.log("Collapsible clicked", collapsed);
            setCollapsed(!collapsed);
          }}
        >
          <FaBars />
        </button>
      </div>

      {/* ADDED: fms-dev, or project name */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="text-gray-900 font-medium">fms-dev</div>
          <div className="text-xs text-gray-400">Node / Free</div>
        </div>
      )}

      {/* CHANGED: Navigation items */}
      {!collapsed && (
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
            {/* Add more as needed: Previews, Disks, Jobs, etc. */}
            <li>
              <a
                href="#scaling"
                className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-gray-700"
              >
                <FaChevronUp size={16} />
                Previews
              </a>
            </li>
            <li>
              <a
                href="#scaling"
                className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-gray-700"
              >
                <FaChevronUp size={16} />
                Disks
              </a>
            </li>
            <li>
              <a
                href="#scaling"
                className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-gray-700"
              >
                <FaChevronUp size={16} />
                Jobs
              </a>
            </li>
            <li>
              <a
                href="#scaling"
                className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-gray-700"
              >
                <FaChevronUp size={16} />
                Start Apps
              </a>
            </li>
            <li>
              <a
                href="#scaling"
                className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-gray-700"
              >
                <FaChevronUp size={16} />
                Weather
              </a>
            </li>
            <li>
              <a
                href="#scaling"
                className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-gray-700"
              >
                <FaChevronUp size={16} />
                Queue
              </a>
            </li>
            <li>
              <a
                href="#scaling"
                className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-gray-700"
              >
                <FaChevronUp size={16} />
                Certificates
              </a>
            </li>
            <li>
              <a
                href="#scaling"
                className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-gray-700"
              >
                <FaChevronUp size={16} />
                Setups
              </a>
            </li>
            <li>
              <a
                href="#scaling"
                className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-gray-700"
              >
                <FaChevronUp size={16} />
                Configurations
              </a>
            </li>
            <li>
              <a
                href="#scaling"
                className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-gray-700"
              >
                <FaChevronUp size={16} />
                Bandwidth
              </a>
            </li>
            <li>
              <a
                href="#scaling"
                className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-gray-700"
              >
                <FaChevronUp size={16} />
                Load
              </a>
            </li>
            <li>
              <a
                href="#scaling"
                className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-gray-700"
              >
                <FaChevronUp size={16} />
                Temperature
              </a>
            </li>
            <li>
              <a
                href="#scaling"
                className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-gray-700"
              >
                <FaChevronUp size={16} />
                Pressure
              </a>
            </li>
            <li>
              <a
                href="#scaling"
                className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-gray-700"
              >
                <FaChevronUp size={16} />
                To Do
              </a>
            </li>
            <li>
              <a
                href="#scaling"
                className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-gray-700"
              >
                <FaChevronUp size={16} />
                AI Robot
              </a>
            </li>
            <li>
              <a
                href="#scaling"
                className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-gray-700"
              >
                <FaChevronUp size={16} />
                ML
              </a>
            </li>
            <li>
              <a
                href="#scaling"
                className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-gray-700"
              >
                <FaChevronUp size={16} />
                Settings
              </a>
            </li>
            <li>
              <a
                href="#scaling"
                className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-gray-700"
              >
                <FaChevronUp size={16} />
                Profile
              </a>
            </li>
            <li>
              <a
                href="#scaling"
                className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-gray-700"
              >
                <FaChevronUp size={16} />
                Updates
              </a>
            </li>
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
      )}
      {/* ADDED: fms-dev, or project name */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="text-gray-900 font-medium">Help ?</div>
          <div className="text-xs text-gray-400">Sign out</div>
        </div>
      )}
    </div>
  );
}

export default Sidebar;
