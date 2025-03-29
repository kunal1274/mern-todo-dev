import React, { useRef } from "react";
import Draggable from "react-draggable";

const FloatingPanel = ({ title, children, onClose, isPinned, onPinToggle }) => {
  const nodeRef = useRef(null); // To attach the draggable node

  return (
    <Draggable nodeRef={nodeRef} disabled={isPinned}>
      <div
        ref={nodeRef}
        className="absolute z-50 bg-white border shadow-lg rounded-md p-4"
        style={{
          width: "250px",
          top: "10px",
          left: "10px",
          cursor: isPinned ? "default" : "move",
        }}
      >
        {/* Header with Title, Close, and Pin Buttons */}
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold">{title}</h3>
          <div className="space-x-2">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="text-red-500 hover:text-red-700 focus:outline-none"
            >
              Close
            </button>
            {/* Pin/Unpin Button */}
            <button
              onClick={onPinToggle}
              className={`px-2 py-1 rounded ${
                isPinned ? "bg-green-500 text-white" : "bg-gray-500 text-white"
              }`}
            >
              {isPinned ? "Unpin" : "Pin"}
            </button>
          </div>
        </div>
        {/* Panel Content */}
        {children}
      </div>
    </Draggable>
  );
};

export default FloatingPanel;
