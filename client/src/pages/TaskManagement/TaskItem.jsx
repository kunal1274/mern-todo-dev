import { useState, useRef, useEffect } from "react";

export default function TaskItem({
  item,
  level,
  onToggleComplete,
  onDelete,
  onEdit,
  onAddSubTask,
  onOpenDueDate,
  onOpenReminder,
  onOpenAssign,
  onSelfAssign,
  detailed,
}) {
  const [expanded, setExpanded] = useState(false);

  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const textRef = useRef(null);

  // Function to toggle the expanded state
  const isToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Check if text overflows the container
  useEffect(() => {
    if (textRef.current) {
      const element = textRef.current;
      setIsOverflowing(element.scrollHeight > element.clientHeight);
    }
  }, [item.description]);

  const hasChildren = item.subTasks && item.subTasks.length > 0;

  // Indentation for horizontal columns
  const containerStyle = {
    display: "inline-block",
    verticalAlign: "top",
    minWidth: "270px",
    marginLeft: level > 0 ? "20px" : "0px",
  };

  const circleStyle = {
    width: "1.2rem",
    height: "1.2rem",
    borderRadius: "9999px",
    border: "2px solid #999",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: "0.5rem",
    backgroundColor: item.status === "Completed" ? "#10b981" : "transparent",
  };

  const toggleExpand = () => setExpanded(!expanded);

  // immediate sub-tasks
  const immediateCount = item.subTasks ? item.subTasks.length : 0;
  const nestedCount = item._nestedSubCount || 0; // see how we stored in flattenAll

  return (
    <div style={containerStyle} className="bg-white rounded shadow p-2 m-2">
      {/* HEAD ROW */}
      <div className="flex items-center mb-1">
        {hasChildren ? (
          <button
            onClick={toggleExpand}
            className="mr-2 text-gray-600 focus:outline-none"
            style={{ background: "transparent", border: "none" }}
          >
            <ExpandableIcon expanded={expanded} />
          </button>
        ) : (
          <span style={{ width: "1rem", display: "inline-block" }} />
        )}
        {/* Circle toggle */}
        <button style={circleStyle} onClick={() => onToggleComplete(item)}>
          {item.status === "Completed" && (
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </button>
        {/* Expand arrow if children */}

        <div className="flex-1">
          <span className="font-semibold">{item.title}</span>
        </div>
      </div>

      {/* Extra info in either compact or detailed form */}
      <div className="text-sm text-gray-600 ml-6">
        <div>
          <strong>Status:</strong> {item.status}{" "}
          {hasChildren && `| ${item.subTasks.length} sub-task(s)`}
        </div>
        <div>
          <strong>Priority:</strong> {item.priority || "P3"}
        </div>
        <div>
          <strong>Immediate SubTasks:</strong> {immediateCount}
        </div>
        <div>
          <strong>All Nested SubTasks:</strong> {nestedCount}
        </div>
        {/* If you want completion ratio: 
            you'd compute how many sub-tasks are completed vs total. 
            That requires more logic or data from backend. */}
        {/* Show tags if any */}
        {item.tags && item.tags.length > 0 && (
          <div>
            <strong>Tags:</strong> {item.tags.map((tg) => tg.name).join(", ")}
          </div>
        )}

        {detailed && (
          <>
            {/* Detailed fields */}
            <div className="">
              <strong>Description:</strong>{" "}
              {/* {item.description ? item.description : "(No Description)"} */}
              <p
                ref={textRef}
                className={`text-sm text-gray-500 overflow-hidden ${
                  isExpanded ? "max-h-full" : "max-h-20"
                }`}
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: isExpanded ? "none" : 3,
                  WebkitBoxOrient: "vertical",
                  wordBreak: "break-word", // Ensures long text breaks into lines
                  overflowWrap: "break-word", // Compatibility for older browsers
                }}
              >
                {item.description || "No Description provided."}
              </p>
              {/* {test.name && test.name.split("\n").length > 4 && (
            <button
              onClick={toggleExpand}
              className="mt-1 text-sm text-blue-500 hover:underline focus:outline-none"
            >
              {isExpanded ? "Read Less" : "Read More..."}
            </button>
          )} */}
              {isOverflowing && (
                <button
                  onClick={isToggleExpand}
                  className="mt-1 text-sm text-blue-500 hover:underline focus:outline-none"
                >
                  {isExpanded ? "Read Less" : "Read More"}
                </button>
              )}
            </div>
            {/* Timestamps always visible */}
            <div>
              <strong>Created:</strong>{" "}
              {item.createdAt
                ? new Date(item.createdAt).toLocaleString()
                : "N/A"}
            </div>
            <div>
              <strong>Updated:</strong>{" "}
              {item.updatedAt
                ? new Date(item.updatedAt).toLocaleString()
                : "N/A"}
            </div>
            {item.dueDate && (
              <div>
                <strong>Due:</strong> {item.dueDate}
                {item.dueTime ? ` at ${item.dueTime}` : ""}
              </div>
            )}
            {item.reminder && item.reminder !== "none" && (
              <div>
                <strong>Reminder:</strong> {item.reminder}
              </div>
            )}
            {item.assignedTo && (
              <div>
                <strong>Assigned To:</strong> {item.assignedTo}
              </div>
            )}
            {item.assignedToGroup && (
              <div>
                <strong>Group:</strong> {item.assignedToGroup}
              </div>
            )}
            {/* If you have assignedTo, assignedToGroup, etc. you can display them here */}
          </>
        )}
      </div>

      {/* ACTIONS */}
      <div className="mt-2 ml-6 space-x-2 flex">
        {/* <button
          onClick={() => onEdit(item)}
          className="px-2 py-1 bg-yellow-500 text-white text-sm rounded flex items-center gap-1"
        >
          <span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M21.1213 2.70705C19.9497 1.53548 18.0503 1.53547 16.8787 2.70705L15.1989 4.38685L7.29289 12.2928C7.16473 12.421 7.07382 12.5816 7.02986 12.7574L6.02986 16.7574C5.94466 17.0982 6.04451 17.4587 6.29289 17.707C6.54127 17.9554 6.90176 18.0553 7.24254 17.9701L11.2425 16.9701C11.4184 16.9261 11.5789 16.8352 11.7071 16.707L19.5556 8.85857L21.2929 7.12126C22.4645 5.94969 22.4645 4.05019 21.2929 2.87862L21.1213 2.70705ZM18.2929 4.12126C18.6834 3.73074 19.3166 3.73074 19.7071 4.12126L19.8787 4.29283C20.2692 4.68336 20.2692 5.31653 19.8787 5.70705L18.8622 6.72357L17.3068 5.10738L18.2929 4.12126ZM15.8923 6.52185L17.4477 8.13804L10.4888 15.097L8.37437 15.6256L8.90296 13.5112L15.8923 6.52185ZM4 7.99994C4 7.44766 4.44772 6.99994 5 6.99994H10C10.5523 6.99994 11 6.55223 11 5.99994C11 5.44766 10.5523 4.99994 10 4.99994H5C3.34315 4.99994 2 6.34309 2 7.99994V18.9999C2 20.6568 3.34315 21.9999 5 21.9999H16C17.6569 21.9999 19 20.6568 19 18.9999V13.9999C19 13.4477 18.5523 12.9999 18 12.9999C17.4477 12.9999 17 13.4477 17 13.9999V18.9999C17 19.5522 16.5523 19.9999 16 19.9999H5C4.44772 19.9999 4 19.5522 4 18.9999V7.99994Z"
                fill="white"
              ></path>
            </svg>
          </span>
          {detailed && <span>Edit</span>}
        </button> */}

        <EditButton item={item} onEdit={onEdit} detailed={detailed} />

        {/* <button
          onClick={() => onDelete(item._id)}
          className="px-2 py-1 bg-red-500 text-white text-sm rounded flex items-center gap-1"
        >
          <span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              width="16"
              height="16"
            >
              <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></g>
              <g id="SVGRepo_iconCarrier">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  fill="white"
                  d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12l1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.13-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z"
                ></path>
              </g>
            </svg>
          </span>
          {detailed && <span>Del</span>}
        </button> */}

        {/* <button
          onClick={() => onAddSubTask(item)}
          className="px-2 py-1 bg-blue-500 text-white text-sm rounded flex items-center gap-1"
        >
          <span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
            >
              <rect
                x="16"
                y="9"
                width="4"
                height="4"
                rx="2"
                transform="rotate(90 16 9)"
                fill="white"
                stroke="white"
                strokeWidth="2"
              ></rect>
              <rect
                x="20"
                y="17"
                width="4"
                height="4"
                rx="2"
                transform="rotate(90 20 17)"
                fill="white"
                stroke="white"
                strokeWidth="2"
              ></rect>
              <path
                d="M5 4V15C5 16.8856 5 17.8284 5.58579 18.4142C6.17157 19 7.11438 19 9 19H16"
                stroke="white"
                strokeWidth="2"
              ></path>
              <path
                d="M5 7V7C5 8.88562 5 9.82843 5.58579 10.4142C6.17157 11 7.11438 11 9 11H12"
                stroke="white"
                strokeWidth="2"
              ></path>
            </svg>
          </span>
          {detailed && <span>+Sub</span>}
        </button> */}

        <AddSubTaskButton
          item={item}
          onAddSubTask={onAddSubTask}
          detailed={detailed}
        />

        <ReminderButton
          item={item}
          onReminder={onOpenReminder}
          detailed={detailed}
        />
        <DueDateButton
          item={item}
          onSetDueDate={onOpenDueDate}
          detailed={detailed}
        />

        {/* <button
          onClick={() => onReminder(item)}
          className="px-2 py-1 bg-purple-500 text-white text-sm rounded flex items-center gap-1"
        >
          <span>
            <svg
              fill="white"
              viewBox="0 0 32 32"
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
            >
              <path d="M30,23.3818l-2-1V20a6.0046,6.0046,0,0,0-5-5.91V12H21v2.09A6.0046,6.0046,0,0,0,16,20v2.3818l-2,1V28h6v2h4V28h6ZM28,26H16V24.6182l2-1V20a4,4,0,0,1,8,0v3.6182l2,1Z"></path>
              <path d="M28,6a2,2,0,0,0-2-2H22V2H20V4H12V2H10V4H6A2,2,0,0,0,4,6V26a2,2,0,0,0,2,2h4V26H6V6h4V8h2V6h8V8h2V6h4v6h2Z"></path>
            </svg>
          </span>
          {detailed && <span>Reminder</span>}
        </button> */}

        {/* <button
          onClick={() => onCustomAction(item)}
          className="px-2 py-1 bg-gray-500 text-white text-sm rounded flex items-center gap-2"
        >
          <span>
            <svg
              viewBox="0 0 22 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
            >
              <path
                d="M4.97879 4.63551C4.97887 4.63462 4.97895 4.63373 4.97903 4.63284C4.97992 4.63276 4.98081 4.63267 4.9817 4.63259C5.43849 4.59036 6.07532 4.54622 6.79718 4.51753C8.25652 4.45955 9.99036 4.46795 11.2768 4.65973C11.3353 4.66845 11.4111 4.70095 11.4872 4.77708L19.2406 12.5304C19.4358 12.7257 19.4358 13.0423 19.2406 13.2375L13.5837 18.8944C13.3884 19.0897 13.0719 19.0897 12.8766 18.8944L5.12325 11.141C5.04711 11.0649 5.01462 10.9891 5.0059 10.9306C4.81412 9.6442 4.80573 7.91035 4.86373 6.451C4.89241 5.72913 4.93656 5.0923 4.97879 4.63551Z"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              ></path>
              <circle
                cx="9.4346"
                cy="9.17334"
                r="1"
                transform="rotate(-45 9.4346 9.17334)"
                fill="white"
              ></circle>
            </svg>
          </span>
          {detailed && <span>Label</span>}
        </button> */}

        <LabelButton
          item={item}
          onAddLabel={() => console.log("label added")}
          detailed={detailed}
        />

        <DeleteButton item={item} onDelete={onDelete} detailed={detailed} />

        <SelfAssignButton
          item={item}
          onSelfAssign={onSelfAssign}
          detailed={detailed}
        />
        {/* <Example /> */}
      </div>

      {/* CHILDREN */}
      {expanded && hasChildren && (
        <div className="mt-2">
          {item.subTasks.map((child) => (
            <TaskItem
              key={child._id}
              item={child}
              level={level + 1}
              onToggleComplete={onToggleComplete}
              onDelete={onDelete}
              onEdit={onEdit}
              onAddSubTask={onAddSubTask}
              detailed={detailed}
            />
          ))}
        </div>
      )}
    </div>
  );
}
