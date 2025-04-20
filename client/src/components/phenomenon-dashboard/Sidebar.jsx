// src/components/Sidebar.jsx
import React from "react";
import { Link } from "react-router-dom";
import { XIcon } from "@heroicons/react/outline";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  return (
    <div
      className={`bg-white shadow-lg w-64 flex-shrink-0 transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <span className="font-bold text-lg">Menu</span>
        <button onClick={toggleSidebar} className="md:hidden">
          <XIcon className="h-6 w-6 text-gray-700" />
        </button>
      </div>
      <nav className="p-4">
        <ul>
          <li className="mb-2">
            <Link to="/" className="block p-2 rounded hover:bg-gray-200">
              Dashboard
            </Link>
          </li>
          <li className="mb-2">
            <Link
              to="/customers"
              className="block p-2 rounded hover:bg-gray-200"
            >
              Customers
            </Link>
          </li>
          {/* Add more sidebar links as required */}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
