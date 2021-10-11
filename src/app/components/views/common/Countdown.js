import { Grid } from "@material-ui/core";
import React, { useEffect, useState } from "react";

export default function CountdownTimer(props) {
   const calculateTimeLeft = () => {
      const difference = new Date(props.date) - new Date();
      let timeLeft = {};

      if (difference > 0) {
         timeLeft = {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            min: Math.floor((difference / 1000 / 60) % 60),
            sec: Math.floor((difference / 1000) % 60),
         };
      }

      return timeLeft;
   };

   const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

   useEffect(() => {
      let timeout = setTimeout(() => {
         setTimeLeft(calculateTimeLeft());
      }, 1000);
      return () => clearTimeout(timeout);
   });

   const timerComponents = [];

   Object.keys(timeLeft).forEach((interval, index) => {
      timerComponents.push(
         <Grid item xs={3} md={2} style={{ textAlign: "center" }} key={index}>
            <div className="timeElement">
               <div className="number">{timeLeft[interval]}</div>
               <div className="label">{interval}</div>
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
                     margin: 0 auto;
                  }
               `}</style>
            </div>
         </Grid>
      );
   });

   return (
      <Grid container justifyContent="center" alignItems="center">
         {timerComponents.length ? (
            timerComponents
         ) : (
            <span style={{ margin: "30px" }}>{props.children}</span>
         )}
      </Grid>
   );
}
