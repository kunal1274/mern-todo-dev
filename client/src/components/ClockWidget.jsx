import React, { useState, useEffect } from "react";
import "./ClockWidget.css";

const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function ClockWidget() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();
  const dayOfWeek = daysOfWeek[time.getDay()];
  const dayOfMonth = time.getDate();
  const month = months[time.getMonth()];

  // Zero-pad minutes/seconds if needed
  const mm = minutes < 10 ? "0" + minutes : minutes;
  const ss = seconds < 10 ? "0" + seconds : seconds;

  // Format the time as HH:MM:SS (24-hour)
  const timeString = `${hours}:${mm}:${ss}`;

  return (
    <div className="clock-widget">
      <div className="time">{timeString}</div>
      <div className="date">
        <div className="dayofweek">{dayOfWeek}</div>
        <div className="dayofmonth">{dayOfMonth}</div>
        <div className="month">{month}</div>
      </div>
    </div>
  );
}

export default ClockWidget;
