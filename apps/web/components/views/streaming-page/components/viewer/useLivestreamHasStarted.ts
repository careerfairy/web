import { useState } from "react"
import { useInterval } from "react-use"
import { useStartsAt } from "store/selectors/streamingAppSelectors"

export const useHasLivestreamStarted = () => {
   const startsAt = useStartsAt()
   const [hasLivestreamStarted, setHasLivestreamStarted] = useState(false)

   useInterval(
      () => {
         setHasLivestreamStarted(startsAt < Date.now())
      },
      startsAt < Date.now() ? 1000 : null
   )

   return hasLivestreamStarted
}
