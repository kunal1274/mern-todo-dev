// src/components/Topbar.jsx

import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useAuthDetailed } from "../../context/AuthContextDetailed.jsx";

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
        <UserProfile />
      </div>
    </header>
  );
}

const UserProfile = ({ item, onEdit, detailed = false }) => {
  const [isHovered, setIsHovered] = useState(false);

  const { user } = useAuthDetailed();
  console.log("line 35 in user profile", user?.email);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        //onClick={() => onEdit(item)}
        className="px-2 py-1 bg-white text-black text-sm rounded flex items-center gap-1 transition-transform duration-200 hover:scale-105 hover:bg-gray-50 active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-100 focus:ring-offset-2"
      >
        <span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
          >
            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
            <g
              id="SVGRepo_tracerCarrier"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></g>
            <g id="SVGRepo_iconCarrier">
              {" "}
              <path
                d="M12.1303 13C13.8203 13 15.1903 11.63 15.1903 9.94C15.1903 8.25001 13.8203 6.88 12.1303 6.88C10.4403 6.88 9.07031 8.25001 9.07031 9.94C9.07031 11.63 10.4403 13 12.1303 13Z"
                stroke="#9901df"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>{" "}
              <path
                d="M17 3H7C4.79086 3 3 4.79086 3 7V17C3 19.2091 4.79086 21 7 21H17C19.2091 21 21 19.2091 21 17V7C21 4.79086 19.2091 3 17 3Z"
                stroke="#9901df"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>{" "}
              <path
                d="M6.30969 20.52C6.27753 19.7534 6.40079 18.9882 6.67199 18.2704C6.94319 17.5526 7.35674 16.8971 7.88781 16.3433C8.41888 15.7894 9.05649 15.3488 9.76226 15.0477C10.468 14.7467 11.2274 14.5916 11.9947 14.5916C12.762 14.5916 13.5214 14.7467 14.2272 15.0477C14.9329 15.3488 15.5705 15.7894 16.1016 16.3433C16.6326 16.8971 17.0462 17.5526 17.3174 18.2704C17.5886 18.9882 17.7118 19.7534 17.6797 20.52"
                stroke="#9901df"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>{" "}
            </g>
          </svg>
        </span>
      </button>
      {isHovered && user?.email && (
        <div className="absolute top-full mt-1 left-1 mr-2 transform -translate-x-1/2 bg-gray-100 text-gray-700 text-xs rounded py-1 px-2 whitespace-nowrap shadow z-10">
          {user?.email || "Unknown Guest"}
        </div>
      )}
    </div>
  );
};

export default Topbar;
