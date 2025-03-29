import React, { useState, useEffect } from "react";
import "./WhiteClock.css";

export default function WhiteClock() {
  // We'll store the current angles for hours, minutes, and seconds:
  const [hoursAngle, setHoursAngle] = useState(0);
  const [minutesAngle, setMinutesAngle] = useState(0);
  const [secondsAngle, setSecondsAngle] = useState(0);

  // A small function to update the angles based on local time
  const updateClock = () => {
    const now = new Date();
    const s = now.getSeconds();
    const m = now.getMinutes();
    const h = now.getHours() % 12;

    // Each second = 6°, minute = 6°, hour = 30° plus fraction
    const secondDeg = s * 6;
    // Minutes: 6° per minute plus 0.1° every second (so the minute hand creeps)
    const minuteDeg = m * 6 + s * 0.1;
    // Hours: 30° per hour plus 0.5° per minute, plus a bit for seconds if you prefer
    const hourDeg = h * 30 + m * 0.5 + s * (0.5 / 60);

    setSecondsAngle(secondDeg);
    setMinutesAngle(minuteDeg);
    setHoursAngle(hourDeg);
  };

  useEffect(() => {
    // Run once immediately
    updateClock();
    // Then run every second
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* The "under" div (gray square) */}
      <div className="under"></div>

      {/* The main container for the clock */}
      <div className="demo-container clocks active bounce">
        <article className="clock ios7 simple station js-london">
          {/* Hours container - we rotate the container (not the .hours child) */}
          <section
            className="hours-container"
            style={{ transform: `rotateZ(${hoursAngle}deg)` }}
          >
            <section className="hours"></section>
          </section>

          {/* Minutes container */}
          <section
            className="minutes-container"
            style={{ transform: `rotateZ(${minutesAngle}deg)` }}
          >
            <section className="minutes"></section>
          </section>

          {/* Seconds container */}
          <section
            className="seconds-container"
            style={{ transform: `rotateZ(${secondsAngle}deg)` }}
          >
            <section className="seconds"></section>
          </section>
        </article>
      </div>
    </>
  );
}
