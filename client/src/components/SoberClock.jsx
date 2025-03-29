import React, { useEffect, useState, useRef } from "react";

/**
 * A minimal, self-contained analog clock with hour/minute/second hands.
 * - No external CSS, everything is inline.
 * - No full-screen container or big vertical spacing.
 * - The second hand won't do a full spin each minute (angles based on real time).
 *
 *
 */

/**
 * FancyClock:
 * - "Bounce" transitions on hour/minute/second hands for normal ticks.
 * - No full spin at each minute boundary (we detect the angle reset and briefly disable transition).
 */
export default function SoberClock() {
  // Current angles for hour, minute, second
  const [hoursDeg, setHoursDeg] = useState(0);
  const [minutesDeg, setMinutesDeg] = useState(0);
  const [secondsDeg, setSecondsDeg] = useState(0);

  // State booleans to disable transitions if we detect a reset from near 360° back to 0°
  const [noTransitionHour, setNoTransitionHour] = useState(false);
  const [noTransitionMinute, setNoTransitionMinute] = useState(false);
  const [noTransitionSecond, setNoTransitionSecond] = useState(false);

  // Store old angles in a ref so we can detect when they jump backward
  const oldAnglesRef = useRef({ hour: 0, minute: 0, second: 0 });

  useEffect(() => {
    const updateAngles = () => {
      const now = new Date();
      const s = now.getSeconds();
      const m = now.getMinutes();
      const h = now.getHours() % 12;

      // Calculate angles from system time
      const newSecondDeg = s * 6;
      const newMinuteDeg = m * 6 + s * 0.1;
      const newHourDeg = h * 30 + m * 0.5 + s * (0.5 / 60);

      // Compare with old angles to detect if we jumped backward (e.g. 354 => 0).
      // If so, we disable transition for that hand, then re-enable next tick.
      const oldSeconds = oldAnglesRef.current.second;
      const oldMinutes = oldAnglesRef.current.minute;
      const oldHours = oldAnglesRef.current.hour;

      // If newSecond < oldSecond => the second hand jumped from 59->0
      if (newSecondDeg < oldSeconds) {
        setNoTransitionSecond(true);
        // Re-enable after a short delay
        setTimeout(() => setNoTransitionSecond(false), 50);
      }

      // If newMinute < oldMinute => minute hand jumped from near 354 => 0
      if (newMinuteDeg < oldMinutes) {
        setNoTransitionMinute(true);
        setTimeout(() => setNoTransitionMinute(false), 50);
      }

      // If newHour < oldHour => hour hand jumped from near 359 => 0 (rare but can happen)
      if (newHourDeg < oldHours) {
        setNoTransitionHour(true);
        setTimeout(() => setNoTransitionHour(false), 50);
      }

      // Update angles
      setSecondsDeg(newSecondDeg);
      setMinutesDeg(newMinuteDeg);
      setHoursDeg(newHourDeg);

      // Save new angles as old
      oldAnglesRef.current = {
        second: newSecondDeg,
        minute: newMinuteDeg,
        hour: newHourDeg,
      };
    };

    // Initial run
    updateAngles();
    // Then run every second
    const timer = setInterval(updateAngles, 1000);
    return () => clearInterval(timer);
  }, []);

  // -- Styling
  // Outer clock face
  const clockStyle = {
    width: "150px",
    height: "150px",
    borderRadius: "50%",
    position: "relative",
    background: "radial-gradient(#000 0.1em, #fff 0.1em, #fff), #fff",
    boxShadow: "0 0 10px rgba(0,0,0,0.4)",
    margin: "0 auto",
  };

  // Center pivot dot
  const centerDotStyle = {
    content: '""',
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "4%",
    height: "4%",
    borderRadius: "50%",
    background: "red",
    zIndex: 10,
  };

  // We'll define the same "bounce" transitions for each container,
  // but skip them if noTransition is true for that hand.
  const bounceHour = !noTransitionHour
    ? "transform 0.3s cubic-bezier(0.4, 2.08, 0.55, 0.44)"
    : "none";
  const bounceMinute = !noTransitionMinute
    ? "transform 0.3s cubic-bezier(0.4, 2.08, 0.55, 0.44)"
    : "none";
  const bounceSecond = !noTransitionSecond
    ? "transform 0.2s cubic-bezier(0.4, 2.08, 0.55, 0.44)"
    : "none";

  // Hour container
  const hoursContainerStyle = {
    position: "absolute",
    inset: 0,
    transform: `rotateZ(${hoursDeg}deg)`,
    transition: bounceHour,
  };
  // Hour hand (short, thick)
  const hoursHandStyle = {
    background: "#000",
    width: "3%",
    height: "35%",
    position: "absolute",
    left: "48.5%",
    top: "25%",
    transformOrigin: "50% 70%",
    borderRadius: "5px",
  };

  // Minute container
  const minutesContainerStyle = {
    position: "absolute",
    inset: 0,
    transform: `rotateZ(${minutesDeg}deg)`,
    transition: bounceMinute,
  };
  // Minute hand (medium length)
  const minutesHandStyle = {
    background: "#000",
    width: "2%",
    height: "50%",
    position: "absolute",
    left: "49%",
    top: "15%",
    transformOrigin: "50% 100%",
    borderRadius: "3px",
  };

  // Second container
  const secondsContainerStyle = {
    position: "absolute",
    inset: 0,
    transform: `rotateZ(${secondsDeg}deg)`,
    transition: bounceSecond,
  };
  // Second hand (long, thin)
  const secondsHandStyle = {
    background: "red",
    width: "1%",
    height: "60%",
    position: "absolute",
    left: "49.5%",
    top: "4%",
    transformOrigin: "50% 100%",
    borderRadius: "1px",
    zIndex: 8,
  };

  return (
    <div style={clockStyle}>
      <div style={centerDotStyle}></div>

      {/* Hours container & hand */}
      <div style={hoursContainerStyle}>
        <div style={hoursHandStyle}></div>
      </div>

      {/* Minutes container & hand */}
      <div style={minutesContainerStyle}>
        <div style={minutesHandStyle}></div>
      </div>

      {/* Seconds container & hand */}
      <div style={secondsContainerStyle}>
        <div style={secondsHandStyle}></div>
      </div>
    </div>
  );
}

export function SoberClock1() {
  const [hoursDeg, setHoursDeg] = useState(0);
  const [minutesDeg, setMinutesDeg] = useState(0);
  const [secondsDeg, setSecondsDeg] = useState(0);

  useEffect(() => {
    const updateAngles = () => {
      const now = new Date();
      const s = now.getSeconds();
      const m = now.getMinutes();
      const h = now.getHours() % 12;

      // Each second = 6°, minute = 6° + fraction, hour = 30° + fraction
      const secondAngle = s * 6;
      const minuteAngle = m * 6 + s * 0.1;
      const hourAngle = h * 30 + m * 0.5 + s * (0.5 / 60);

      setSecondsDeg(secondAngle);
      setMinutesDeg(minuteAngle);
      setHoursDeg(hourAngle);
    };

    updateAngles();
    const timer = setInterval(updateAngles, 1000);
    return () => clearInterval(timer);
  }, []);

  // Minimal inline styles:
  // The outer "clock" container is sized ~150px, circular with a radial gradient
  // The hand containers are absolutely positioned to rotate each hand
  const clockStyle = {
    width: "150px",
    height: "150px",
    borderRadius: "50%",
    position: "relative",
    background: "radial-gradient(#000 0.1em, #fff 0.1em, #fff), #fff",
    margin: "0 auto", // center if desired
    //  The subtle outer shadow:
    boxShadow: "0 0 8px rgba(0,0,0,0.3)", // <--- HIGHLIGHT: new line
    // boxShadow: "0 0 0.2em rgba(0,0,0,0.15) inset",
    overflow: "hidden",
    // We'll fade it in
    opacity: 1,
  };

  const centerDotStyle = {
    content: '""',
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "4%",
    height: "4%",
    borderRadius: "50%",
    background: "red",
    zIndex: 10,
  };

  // The container that rotates the hour hand
  const hoursContainerStyle = {
    position: "absolute",
    inset: 0,
    transform: `rotateZ(${hoursDeg}deg)`,
    // "bounce" transition (remove if you want no bounce):
    transition: "transform 0.3s cubic-bezier(0.4, 2.08, 0.55, 0.44)",
  };

  // The hour hand rectangle (shortest, thickest):
  const hoursHandStyle = {
    background: "#000",
    width: "3%", // thick
    height: "35%", // short
    position: "absolute",
    left: "48.5%",
    top: "25%",
    transformOrigin: "50% 70%",
    borderRadius: "2px",
  };

  // The container that rotates the minute hand
  const minutesContainerStyle = {
    position: "absolute",
    inset: 0,
    transform: `rotateZ(${minutesDeg}deg)`,
    // bounce transition
    transition: "transform 0.3s cubic-bezier(0.4, 2.08, 0.55, 0.44)",
  };

  // The minute hand rectangle (medium length, medium thickness):
  const minutesHandStyle = {
    background: "#000",
    width: "2%",
    height: "50%",
    position: "absolute",
    left: "49%",
    top: "15%",
    transformOrigin: "50% 100%",
    borderRadius: "2px",
  };

  // The container that rotates the second hand
  const secondsContainerStyle = {
    position: "absolute",
    inset: 0,
    transform: `rotateZ(${secondsDeg}deg)`,
    // bounce transition
    transition: "transform 0.2s cubic-bezier(0.4, 2.08, 0.55, 0.44)",
  };

  // The second hand rectangle (longest, thinnest):
  const secondsHandStyle = {
    background: "red",
    width: "1%",
    height: "60%",
    position: "absolute",
    left: "49.5%",
    top: "4%",
    transformOrigin: "50% 100%",
    zIndex: 8,
    borderRadius: "1px",
  };

  return (
    <div style={clockStyle}>
      {/* "Center Dot" (via absolutely positioned div) */}
      <div style={centerDotStyle}></div>

      {/* Hours container & hand */}
      <div style={hoursContainerStyle}>
        <div style={hoursHandStyle}></div>
      </div>

      {/* Minutes container & hand */}
      <div style={minutesContainerStyle}>
        <div style={minutesHandStyle}></div>
      </div>

      {/* Seconds container & hand */}
      <div style={secondsContainerStyle}>
        <div style={secondsHandStyle}></div>
      </div>
    </div>
  );
}
