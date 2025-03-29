import React, { useState, useEffect } from "react";
import "./MetalClock.css";

/**
 * Helper arrays if you want to place standard numerals around the clock.
 * We'll place them by absolute positioning & transform rotate.
 */
const numerals = [
  { value: "12", deg: 0 },
  { value: "1", deg: 30 },
  { value: "2", deg: 60 },
  { value: "3", deg: 90 },
  { value: "4", deg: 120 },
  { value: "5", deg: 150 },
  { value: "6", deg: 180 },
  { value: "7", deg: 210 },
  { value: "8", deg: 240 },
  { value: "9", deg: 270 },
  { value: "10", deg: 300 },
  { value: "11", deg: 330 },
];

function MetalClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    // Update every second
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Extract hours, minutes, seconds
  const seconds = time.getSeconds();
  const minutes = time.getMinutes() + seconds / 60; // fractional
  const hours = (time.getHours() % 12) + minutes / 60; // fractional

  // Calculate angles
  //  - second hand: 6 deg per second (360 / 60)
  //  - minute hand: 6 deg per minute
  //  - hour hand:   30 deg per hour (360 / 12), plus fraction for minutes
  const secondAngle = seconds * 6;
  const minuteAngle = minutes * 6;
  const hourAngle = hours * 30;

  // We apply these angles as inline style transforms on each hand
  const secondStyle = {
    transform: `translateX(-50%) translateY(-100%) rotate(${secondAngle}deg)`,
  };
  const minuteStyle = {
    transform: `translateX(-50%) translateY(-88%) rotate(${minuteAngle}deg)`,
  };
  const hourStyle = {
    transform: `translateX(-50%) translateY(-70%) rotate(${hourAngle}deg)`,
  };

  return (
    <div className="metal-clock-container">
      {/* Outer metallic ring */}
      <div className="outer-ring">
        {/* Inner off-white face */}
        <div className="clock-face">
          {/* Numerals around the face */}
          {numerals.map((num) => (
            <div
              key={num.value}
              className="clock-number"
              style={{ transform: `rotate(${num.deg}deg)` }}
            >
              <span style={{ transform: `rotate(${-num.deg}deg)` }}>
                {num.value}
              </span>
            </div>
          ))}

          {/* "quartz" text near bottom */}
          <div className="quartz-label">quartz</div>

          {/* The center pivot circle */}
          <div className="center-pin" />

          {/* Hour hand */}
          <div className="hour-hand" style={hourStyle} />

          {/* Minute hand */}
          <div className="minute-hand" style={minuteStyle} />

          {/* Second hand (red) */}
          <div className="second-hand" style={secondStyle} />
        </div>
      </div>
    </div>
  );
}

export default MetalClock;
