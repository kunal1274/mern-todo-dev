const NavigationTest = ({ onNavigate }) => {
    return (
      <nav className="w-64 bg-gray-100 h-screen p-6 border-r shadow">
        <h3 className="text-xl font-semibold text-blue-600 mb-4">Test Items</h3>
        <ul className="space-y-3">
          {[
            "Send OTP",
            "Verify OTP",
            "Test Maps Directions",
            "Test Maps Multiple Markers",
          ].map((item, index) => (
            <li key={index}>
              <button
                onClick={() => onNavigate(item)}
                className="w-full text-left px-4 py-2 rounded-lg bg-gray-200 hover:bg-blue-500 hover:text-white transition duration-300 text-gray-700"
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    );
  };
  
  export default NavigationTest;