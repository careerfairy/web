import { useEffect, useState } from "react"

type UseTemporaryStateOptions = {
   duration?: number
   onReset?: () => void
}

export const useTemporaryActiveState = (
   options: UseTemporaryStateOptions = {}
) => {
   const { duration = 1300, onReset } = options
   const [isActive, setIsActive] = useState(false)

   useEffect(() => {
      if (isActive) {
         const timer = setTimeout(() => {
            setIsActive(false)
            onReset?.()
         }, duration)
         return () => clearTimeout(timer)
      }
   }, [isActive, duration, onReset])

   return {
      isActive,
      setIsActive,
   }
}
