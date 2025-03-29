import React from "react";
import styles from "./AnalogClock.module.css";

const AnalogClock = () => {
  return (
    <div className={styles.clock}>
      <div className={styles.a}>
        <div className={styles.b}>
          <div className={styles.c}>
            <div className={styles.d}>
              {/* Shadow hands */}
              <div className={styles.sh}>
                <div className={styles.hh}>
                  <div className={styles.h}></div>
                </div>
                <div className={styles.mm}>
                  <div className={styles.m}></div>
                  <div className={styles.mr}></div>
                </div>
                <div className={styles.ss}>
                  <div className={styles.s}></div>
                </div>
              </div>

              {/* Tick marks */}
              <div className={styles.ii}>
                <b>
                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>
                </b>
                <b>
                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>
                </b>
                <b>
                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>
                </b>
                <b>
                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>
                </b>
                <b>
                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>
                </b>
                <b>
                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>
                </b>
              </div>

              {/* Clock face with numbers */}
              <div className={styles.e}>
                <div className={styles.f}>
                  <u>
                    12
                    <u>
                      1
                      <u>
                        2<u>3</u>4
                      </u>
                      5
                    </u>
                  </u>
                </div>
                <div className={styles.g}>
                  <u>
                    <u>
                      11
                      <u>
                        10
                        <u>9</u>8
                      </u>
                      7
                    </u>
                    6
                  </u>
                </div>
                <div className={styles.q}>
                  <a
                    href=""
                    style={{
                      position: "relative",
                      zIndex: 1000,
                      color: "#222",
                      textDecoration: "none",
                    }}
                  >
                    Quartz : TO DO
                  </a>
                </div>
              </div>

              {/* Foreground hands */}
              <div className={styles.hh}>
                <div className={styles.h}></div>
              </div>
              <div className={styles.mm}>
                <div className={styles.m}></div>
                <div className={styles.mr}></div>
              </div>
              <div className={styles.ss}>
                <div className={styles.s}></div>
                <div className={styles.sr}></div>
              </div>

              {/* Glossy overlay */}
              <div className={styles.k}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalogClock;
