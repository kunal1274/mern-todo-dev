import React, { useEffect, useState } from "react";
import "./FancyClock.css";

export default function FancyClock() {
  // We'll store the angles for hours, minutes, seconds
  const [hoursDeg, setHoursDeg] = useState(0);
  const [minutesDeg, setMinutesDeg] = useState(0);
  const [secondsDeg, setSecondsDeg] = useState(0);

  // Update the angles every second
  useEffect(() => {
    const updateAngles = () => {
      const now = new Date();
      const s = now.getSeconds();
      const m = now.getMinutes();
      const h = now.getHours() % 12;

      // Each second = 6°, minute = 6°, hour = 30° + fraction
      // We also let minute & hour hands move gradually as seconds pass
      const secondAngle = s * 6;
      const minuteAngle = m * 6 + s * 0.1;
      const hourAngle = h * 30 + m * 0.5 + s * (0.5 / 60);

      setSecondsDeg(secondAngle);
      setMinutesDeg(minuteAngle);
      setHoursDeg(hourAngle);
    };

    // Initial update
    updateAngles();
    // Then run every second
    const timer = setInterval(updateAngles, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <div>
        {/* Gray square behind the clock */}
        {/* <div className="under"></div> */}
        {/* Container matching your original HTML structure */}
        <div className="demo-container clocks active bounce">
          {/* 
          We preserve the same classes: clock ios7 simple station js-london
          plus 'show' so it animates in (fade+shift).
        */}
          <article className="clock ios7 simple station js-london show">
            {/* Hours container, rotate by hoursDeg */}
            <section
              className="hours-container"
              style={{ transform: `rotateZ(${hoursDeg}deg)` }}
            >
              <section className="hours" />
            </section>

            {/* Minutes container, rotate by minutesDeg */}
            <section
              className="minutes-container"
              style={{ transform: `rotateZ(${minutesDeg}deg)` }}
            >
              <section className="minutes" />
            </section>

            {/* Seconds container, rotate by secondsDeg */}
            <section
              className="seconds-container"
              style={{ transform: `rotateZ(${secondsDeg}deg)` }}
            >
              <section className="seconds" />
            </section>
          </article>
        </div>
      </div>
    </>
  );
}
