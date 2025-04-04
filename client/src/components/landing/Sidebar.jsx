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
  FaSignOutAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuthDetailed } from "../../context/AuthContextDetailed";

function Sidebar() {
  // CHANGED: State to track whether sidebar is collapsed
  const [collapsed, setCollapsed] = useState(false);

  const navigate = useNavigate();
  const { logout } = useAuthDetailed();

  return (
    <div
      className={`border-r border-gray-200 bg-white flex flex-col text-sm
        ${collapsed ? "w-16" : "w-60"}
        transition-all duration-300`}
    >
      {/* Header Section */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center">
          {collapsed ? (
            // ADDED: When collapsed, show a simple logo icon
            <FaCube
              className="text-purple-600 hover:text-purple-700 cursor-pointer"
              onClick={() => {
                setCollapsed(!collapsed);
              }}
              size={20}
            />
          ) : (
            // ADDED: When expanded, show full text logo
            <>
              <div className="font-semibold text-purple-600 border-r pr-2">
                Ratxen
              </div>
              <div className="font-semibold text-purple-600 pl-2">
                My Workspace
              </div>
            </>
          )}
        </div>
        {/* Toggle Button */}
        {!collapsed && (
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={() => {
              setCollapsed(!collapsed);
            }}
          >
            <FaBars />
          </button>
        )}
      </div>

      {/* Project Info Section (hidden when collapsed) */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="text-gray-900 font-medium">fms-dev</div>
          <div className="text-xs text-gray-400">Node / Free</div>
        </div>
      )}

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-hidden hover:overflow-y-auto transition-all duration-300">
        <ul>
          <li>
            <a
              href="#events"
              className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-gray-700"
            >
              <FaTachometerAlt size={16} />
              {/* CHANGED: Only show text when not collapsed */}
              {!collapsed && "Events"}
            </a>
          </li>
          <li>
            <a
              href="#settings"
              className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-gray-700"
            >
              <FaCog size={16} />
              {!collapsed && "Settings"}
            </a>
          </li>
          <li>
            <a
              href="#environment"
              className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-gray-700"
            >
              <FaCube size={16} />
              {!collapsed && "Environment"}
            </a>
          </li>
          <li>
            <a
              href="#shell"
              className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-gray-700"
            >
              <FaTerminal size={16} />
              {!collapsed && "Shell"}
            </a>
          </li>
          <li>
            <a
              href="#scaling"
              className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-gray-700"
            >
              <FaChevronUp size={16} />
              {!collapsed && "Scaling"}
            </a>
          </li>
          <li>
            <a
              href="#previews"
              className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-gray-700"
            >
              <FaChevronUp size={16} />
              {!collapsed && "Previews"}
            </a>
          </li>
          <li>
            <a
              href="#disks"
              className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-gray-700"
            >
              <FaChevronUp size={16} />
              {!collapsed && "Disks"}
            </a>
          </li>
          <li>
            <a
              href="#jobs"
              className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-gray-700"
            >
              <FaChevronUp size={16} />
              {!collapsed && "Jobs"}
            </a>
          </li>
          <li>
            <a
              href="#start-apps"
              className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-gray-700"
            >
              <FaChevronUp size={16} />
              {!collapsed && "Start Apps"}
            </a>
          </li>
          <li>
            <a
              href="#weather"
              className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-gray-700"
            >
              <FaChevronUp size={16} />
              {!collapsed && "Weather"}
            </a>
          </li>
          <li>
            <a
              href="#queue"
              className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-gray-700"
            >
              <FaChevronUp size={16} />
              {!collapsed && "Queue"}
            </a>
          </li>
          <li>
            <a
              href="#certificates"
              className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-gray-700"
            >
              <FaChevronUp size={16} />
              {!collapsed && "Certificates"}
            </a>
          </li>
          <li>
            <a
              href="#setups"
              className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-gray-700"
            >
              <FaChevronUp size={16} />
              {!collapsed && "Setups"}
            </a>
          </li>
          <li>
            <a
              href="#configurations"
              className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-gray-700"
            >
              <FaChevronUp size={16} />
              {!collapsed && "Configurations"}
            </a>
          </li>
          <li>
            <a
              href="#bandwidth"
              className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-gray-700"
            >
              <FaChevronUp size={16} />
              {!collapsed && "Bandwidth"}
            </a>
          </li>
          <li>
            <a
              href="#load"
              className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-gray-700"
            >
              <FaChevronUp size={16} />
              {!collapsed && "Load"}
            </a>
          </li>
          <li>
            <a
              href="#temperature"
              className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-gray-700"
            >
              <FaChevronUp size={16} />
              {!collapsed && "Temperature"}
            </a>
          </li>
          <li>
            <a
              href="#pressure"
              className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-gray-700"
            >
              <FaChevronUp size={16} />
              {!collapsed && "Pressure"}
            </a>
          </li>
          <li>
            <a
              href="#todo"
              className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-gray-700"
            >
              <FaChevronUp size={16} />
              {!collapsed && "To Do"}
            </a>
          </li>
          <li>
            <a
              href="#ai-robot"
              className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-gray-700"
            >
              <FaChevronUp size={16} />
              {!collapsed && "AI Robot"}
            </a>
          </li>
          <li>
            <a
              href="#ml"
              className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-gray-700"
            >
              <FaChevronUp size={16} />
              {!collapsed && "ML"}
            </a>
          </li>
          <li>
            <a
              href="#profile"
              className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-gray-700"
            >
              <FaChevronUp size={16} />
              {!collapsed && "Profile"}
            </a>
          </li>
          <li>
            <a
              href="#updates"
              className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-gray-700"
            >
              <FaChevronUp size={16} />
              {!collapsed && "Updates"}
            </a>
          </li>
          <li>
            <a
              href="#extensions"
              className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-gray-700"
            >
              <FaChevronUp size={16} />
              {!collapsed && "Extensions"}
            </a>
          </li>
        </ul>
      </nav>

      {/* Footer Section */}
      <div className="px-4 py-3 border-t border-gray-200">
        {/* Optional Help text is hidden when collapsed */}
        {!collapsed && (
          <div className="text-gray-900 font-normal mb-2">Help ?</div>
        )}
        <div
          onClick={() => {
            logout();
            navigate("/");
          }}
          className="text-xs font-bold text-purple-600 cursor-pointer hover:text-purple-700"
        >
          {/* CHANGED: When collapsed, show an icon for sign out */}
          {!collapsed ? "Sign out" : <FaSignOutAlt size={16} />}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
