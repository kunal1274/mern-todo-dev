import React, { useState, useEffect } from "react";
import styles from "./AnalogClock.module.css";

const AnalogClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const secondsDeg = (time.getSeconds() / 60) * 360;
  const minutesDeg = (time.getMinutes() / 60) * 360 + secondsDeg / 60;
  const hoursDeg = ((time.getHours() % 12) / 12) * 360 + minutesDeg / 12;

  return (
    <div className={styles.clock}>
      <div className={styles.face}>
        <div
          className={`${styles.hand} ${styles.hour}`}
          style={{ transform: `rotate(${hoursDeg}deg)` }}
        />
        <div
          className={`${styles.hand} ${styles.minute}`}
          style={{ transform: `rotate(${minutesDeg}deg)` }}
        />
        <div
          className={`${styles.hand} ${styles.second}`}
          style={{ transform: `rotate(${secondsDeg}deg)` }}
        />
        <div className={styles.centerDot}></div>
      </div>
    </div>
  );
};

export default AnalogClock;
