import React, { useCallback, useEffect, useState } from "react";

const smoothness = 1;

const useTimeOut = ({ delay = 3000 }) => {
   const [isCountingDown, setIsCountingDown] = useState(false);
   const SPEED = isNaN(smoothness) ? 2 : smoothness;
   const DELAY = isNaN(delay) ? 3000 : delay;
   const INTERVAL = 10 / SPEED;
   const TICK_RATE = DELAY / (INTERVAL * SPEED) / SPEED;

   const [progress, setProgress] = useState(INTERVAL);

   useEffect(() => {
      if (isCountingDown) {
         setProgress(INTERVAL);
         const timer = setInterval(() => {
            setProgress((prevProgress) =>
               prevProgress >= 100 ? INTERVAL : prevProgress + INTERVAL
            );
         }, TICK_RATE);
         const timeout = setTimeout(() => {
            setIsCountingDown(false);
         }, DELAY);
         return () => {
            clearTimeout(timeout);
            clearInterval(timer);
         };
      }
   }, [isCountingDown]);

   const startCountDown = useCallback(() => {
      setIsCountingDown(true);
   }, []);
   const stopCountDown = useCallback(() => {
      setIsCountingDown(false);
   }, []);

   return { isCountingDown, progress, startCountDown, stopCountDown };
};

export default useTimeOut;
