import { useState, useEffect } from "react"

// The interval at which the value will be updated (in milliseconds)
const interval = 60

// This is a custom hook that takes an initial value and a timeout (in milliseconds) as arguments
const useAnimatedNumber = (
   initialValue: number,
   timeout: number = 1000
): number => {
   // Initialize the value state with the initial value
   const [value, setValue] = useState(initialValue)

   // The useEffect hook is used to perform side effects on each render
   useEffect(() => {
      // Save the current value in a variable
      let currentValue = value
      // Save the target value (the initial value) in a variable
      let targetValue = initialValue
      // Calculate the increment that will be added to the current value on each interval
      let increment = (targetValue - currentValue) / (timeout / interval)

      // Set an interval that will run every 'interval' milliseconds
      const intervalId = setInterval(() => {
         // Add the increment to the current value
         currentValue += increment
         // Update the value state with the new current value
         setValue(currentValue)

         // If the current value has reached the target value, clear the interval
         if (currentValue === targetValue) {
            clearInterval(intervalId)
         }
      }, interval)

      // Return a cleanup function that will be called when the component unmounts
      return () => clearInterval(intervalId)
   }, [initialValue, timeout, value])

   // Return the value state
   return value
}

export default useAnimatedNumber
