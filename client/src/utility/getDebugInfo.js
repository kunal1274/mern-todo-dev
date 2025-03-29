export function getDebugInfo() {
    const stack = new Error().stack;
    if (!stack) return "Unknown location";
  
    // Extract the third line of the stack (assuming it's where the utility was called)
    const stackLines = stack.split("\n");
    if (stackLines.length < 3) return "Unknown location";
  
    const targetLine = stackLines[2].trim(); // Adjust index if needed
    const match = targetLine.match(/at\s+([^(]+)?\(?(.+):(\d+):(\d+)/);
  
    if (match) {
      const functionName = match[1] ? match[1].trim() : "Unknown function";
      const fileName = match[2].split("/").pop(); // Get the file name only
      const lineNumber = match[3];
  
      return `${fileName} for method/function: ${functionName} at line num: ${lineNumber}`;
    }
  
    return "Unknown location";
  }

  export default function logWithDebugInfo(message, ...args) {
    console.log(`[${getDebugInfo()}] ${message}`, ...args);
  }
  
  