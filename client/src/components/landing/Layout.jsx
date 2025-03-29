// src/components/Layout.jsx

import React from "react";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";

function Layout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 overflow-hidden hover:overflow-auto bg-gray-50 p-4">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;
