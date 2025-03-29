import React, { useState, useEffect } from "react";
import "./DigitalClock.css";

const WEEKDAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

function DigitalClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    // Update every second
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Extract hours, minutes, seconds
  let hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  // Determine AM/PM
  const ampm = hours >= 12 ? "PM" : "AM";

  // Convert 24-hr to 12-hr
  if (hours === 0) {
    hours = 12;
  } else if (hours > 12) {
    hours -= 12;
  }

  // Zero-pad
  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");

  // Current weekday index (0 => Sunday, 1 => Monday, etc.)
  // JS getDay() returns 0 for Sunday, 6 for Saturday.
  // But our array has Monday at index 0, so let's adapt:
  const jsDay = time.getDay(); // Sunday=0, Monday=1, ...
  // We'll reorder so that MON=0 => Sunday=6
  let highlightIndex = jsDay - 1;
  if (highlightIndex < 0) highlightIndex = 6; // Sunday => index 6

  return (
    <div className="clock-container">
      <div className="clock-weekdays">
        {WEEKDAYS.map((day, i) => (
          <span key={day} className={i === highlightIndex ? "active-day" : ""}>
            {day}
          </span>
        ))}
      </div>
      <div className="clock-time">
        <span className="time-digits">
          {hh}:{mm}:{ss}
        </span>
        <span className="time-ampm">{ampm}</span>
      </div>
    </div>
  );
}

export default DigitalClock;
