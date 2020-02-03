import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";

export default function CountdownTimer(props) {
  const calculateTimeLeft = () => {
    const difference = +new Date(props.date) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
  });

  const timerComponents = [];

  Object.keys(timeLeft).forEach(interval => {

    timerComponents.push(
      <div className='timeElement'>
        <div className='number'>
            {timeLeft[interval]}
        </div>
        <div className='label'>
            {interval}
        </div>
        <style jsx>{`
            .timeElement {
                display: inline-block;
                margin: 0 10px;
            }

            .timeElement .number {
                font-size: 2em;
                margin: 10px 0 30px 0;
                font-weight: 500;
            }

            .timeElement .label {
                font-weight: 300;
            }
        `}</style>
      </div>
    );
  });

  return (
    <div>
      {timerComponents.length ? timerComponents : <span>Time's up!</span>}
    </div>
  );
}