import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Grid } from "semantic-ui-react";

export default function CountdownTimer(props) {
  const calculateTimeLeft = () => {
    const difference = new Date(props.date) - new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        min: Math.floor((difference / 1000 / 60) % 60),
        sec: Math.floor((difference / 1000) % 60)
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
      <Grid.Column mobile='4' tablet='3' computer='2' textAlign='center'>
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
                  padding-top: 100%;
                  width: 50%;
                  padding: 5px 0 0 0;
                  text-align: center;
                  margin: 0 auto;
              }

              .timeElement .number {
                  font-size: 1.6em;
                  margin: 15px auto;
                  font-weight: 500;
              }

              .label {
                  font-size: 0.8em;
                  font-weight: 300;
                  color: rgb(100,100,100);
                  margin: 0 auto;
              }
          `}</style>
        </div>
      </Grid.Column>
    );
  });

  return (
    <div>
      <Grid centered>
      {timerComponents.length ? timerComponents : <span>Time's up!</span>}
      </Grid>
    </div>
  );
}