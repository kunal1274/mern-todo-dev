import React, { useState, useEffect } from "react";

const SvgAnalogClock = () => {
  // 1) State to store the current time
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    // 2) Update time every second
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    // Cleanup on unmount
    return () => clearInterval(timer);
  }, []);

  // 3) Calculate angles for hour, minute, second hands
  const hour = time.getHours() % 12;
  const minute = time.getMinutes();
  const second = time.getSeconds();

  // Hours in seconds: hour * 3600 + minute * 60 + second
  const hoursInSecs = hour * 3600 + minute * 60 + second;
  // Minutes in seconds: minute * 60 + second
  const minutesInSecs = minute * 60 + second;

  // 12 hours => 43200 seconds, so hour-hand fraction = hoursInSecs / 43200
  const hourAngle = 360 * (hoursInSecs / 43200);
  // 60 minutes => 3600 seconds, so minute-hand fraction = minutesInSecs / 3600
  const minuteAngle = 360 * (minutesInSecs / 3600);
  // 60 seconds => second-hand fraction = second / 60
  const secondAngle = 360 * (second / 60);

  // 4) Transform strings for each hand
  const hourTransform = `rotate(${hourAngle} 400 400)`;
  const minuteTransform = `rotate(${minuteAngle} 400 400)`;
  const secondTransform = `rotate(${secondAngle} 400 400)`;

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 801 801"
      preserveAspectRatio="xMidYMid meet"
      contentScriptType="text/ecmascript"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      // xlink namespace is required for <use> references
      xmlnsXlink="http://www.w3.org/1999/xlink"
      style={
        {
          //backgroundColor: "lightsteelblue",
          // Optionally set a fixed width/height here or let parent container handle it
          // width: '400px',
          // height: '400px'
        }
      }
    >
      {/* 
        5) This <style> block is inline but you could place it in a separate CSS file 
        if preferred. It's the same styling from your original code.
      */}
      <style>
        {`
          #indicator-hands polygon {
            opacity:      0.8;
            stroke:       black;
            stroke-width: 1;
          }
        `}
      </style>

      <title>SVG Analog Clock</title>
      <desc>SVG Analog Clock in React, adapted from your original code.</desc>

      {/* The big circle clock face */}
      <circle
        cx="400"
        cy="400"
        r="350"
        strokeWidth="14"
        stroke="steelblue"
        fill="lightblue"
      />

      {/* 
        6) Original <symbol> definitions. 
        We'll keep them exactly as is for the “minute marker” polygons. 
      */}
      <symbol id="min-15">
        <polygon fill="steelblue" points="390,50 410,50 400,125" />
      </symbol>

      <symbol id="min-05">
        <polygon fill="steelblue" points="390,50 410,50 400,80" />
      </symbol>

      {/* 
        7) Markers around the clock – using <use> with transform. 
        (These are static markers – no need to dynamically rotate them with React.) 
      */}
      <use xlinkHref="#min-15" />
      <use xlinkHref="#min-05" transform="rotate(30 400 400)" />
      <use xlinkHref="#min-05" transform="rotate(60 400 400)" />
      <use xlinkHref="#min-15" transform="rotate(90 400 400)" />
      <use xlinkHref="#min-05" transform="rotate(120 400 400)" />
      <use xlinkHref="#min-05" transform="rotate(150 400 400)" />
      <use xlinkHref="#min-15" transform="rotate(180 400 400)" />
      <use xlinkHref="#min-05" transform="rotate(210 400 400)" />
      <use xlinkHref="#min-05" transform="rotate(240 400 400)" />
      <use xlinkHref="#min-15" transform="rotate(270 400 400)" />
      <use xlinkHref="#min-05" transform="rotate(300 400 400)" />
      <use xlinkHref="#min-05" transform="rotate(330 400 400)" />

      {/* 
        8) The indicator hands (hour/minute/second) 
        We'll apply the dynamic rotation via transform attributes 
      */}
      <g id="indicator-hands">
        <polygon
          id="hour"
          fill="indianred"
          points="350,450 450,450 400,150"
          transform={hourTransform}
        />
        <polygon
          id="minute"
          fill="lightcoral"
          points="375,425 425,425 400,70"
          transform={minuteTransform}
        />
        <polygon
          id="second"
          fill="#ff8f8f"
          points="390,410 410,410 400,59"
          transform={secondTransform}
        />
      </g>

      {/* Small circle in the center */}
      <circle
        cx="400"
        cy="400"
        r="6"
        strokeWidth="1"
        stroke="black"
        fill="lightsteelblue"
      />
    </svg>
  );
};

export default SvgAnalogClock;
