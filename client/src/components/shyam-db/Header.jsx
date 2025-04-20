import React from "react";

export default function HeaderShyam() {
  return (
    <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
      <h2 className="text-lg font-semibold text-gray-700">Dashboard</h2>
      <div className="flex items-center gap-4">
        <button className="text-sm text-gray-600 hover:text-blue-600">
          Notifications
        </button>
        <div className="w-8 h-8 bg-gray-300 rounded-full overflow-hidden">
          {/* Example user avatar area */}
        </div>
      </div>
    </header>
  );
}
