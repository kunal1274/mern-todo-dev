// src/components/Topbar.jsx

import React from "react";

function Topbar() {
  return (
    <header className="flex items-center justify-between px-6 h-11 bg-white border-b border-gray-200">
      {/* Left side: name + info */}
      <div className="flex items-center gap-3">
        {/* "fms-dev" / Node / Free, or any labels */}
        <div className="font-semibold text-gray-800">fms-dev</div>
        <span className="text-sm text-gray-400">Node</span>
        <span className="text-sm text-gray-400">Free</span>
      </div>

      {/* Right side: action buttons */}
      <div className="flex items-center gap-4">
        <button className="text-sm text-blue-600 font-medium hover:text-blue-800">
          Connect
        </button>
        <button className="bg-gray-100 text-sm text-gray-700 px-3 py-1 border border-gray-300 rounded hover:bg-gray-200">
          Manual Deploy
        </button>
      </div>
    </header>
  );
}

export default Topbar;
