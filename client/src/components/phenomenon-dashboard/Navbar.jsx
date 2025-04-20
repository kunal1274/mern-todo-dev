// src/components/Navbar.jsx
import React from "react";
import { MenuIcon } from "@heroicons/react/outline";

const Navbar = ({ toggleSidebar }) => {
  return (
    <nav className="bg-white shadow px-4 py-3 flex items-center justify-between">
      <div className="flex items-center">
        <button onClick={toggleSidebar} className="md:hidden mr-4">
          <MenuIcon className="h-6 w-6 text-gray-700" />
        </button>
        <span className="text-xl font-semibold">My Dashboard</span>
      </div>
      <div>
        <span className="text-gray-600">User Name</span>
      </div>
    </nav>
  );
};

export default Navbar;
