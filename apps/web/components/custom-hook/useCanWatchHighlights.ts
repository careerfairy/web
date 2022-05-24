import { useCallback, useEffect, useState } from "react"
import { parseCookies, setCookie } from "nookies"
import { getMillisecondsBetweenDates } from "../../util/CommonUtil"
import { useAuth } from "../../HOCs/AuthProvider"
import { usePrevious } from "react-use"
import isEqual from "react-fast-compare"

const timeOut: number = 30000
const cookieName: string = "canWatchHighlights"
interface Props {
   // How long you want to wait before you can watch again in milliseconds
   timoutDuration?: number
   // If these change, we will check if the user can watch again
   deps?: any[]
}
const useCanWatchHighlights = ({
   timoutDuration = timeOut,
   deps,
}: Props = {}) => {
   const { userPresenter, userData } = useAuth()
   const prevDeps = usePrevious(deps)

   /*
    * Check if the user can watch highlights.
    * - If they can, we return {canWatchAll: true, timeLeft: 0}
    * - If they can't, we return {canWatchAll: false, timeLeft: timeLeft}
    * */
   const checkIfCanWatchHighlight = useCallback(() => {
      if (userPresenter?.canWatchAllHighlights()) {
         return { canWatchAll: true, timeLeft: 0 }
      }
      const cookies = parseCookies()
      const cookieExpiry = cookies[cookieName]

      if (cookieExpiry) {
         const cookieExpiryDate = new Date(cookieExpiry)
         const now = new Date()
         return {
            canWatchAll: now > cookieExpiryDate,
            timeLeft: getMillisecondsBetweenDates(cookieExpiryDate, now),
         }
      }
      // If we don't have a cookie, we can watch all highlights
      return { canWatchAll: true, timeLeft: 0 }
   }, [userData?.badges])

   const [canWatchAllHighlights, setCanWatchAllHighlights] = useState<{
      canWatchAll: boolean
      timeLeft: number
   }>(checkIfCanWatchHighlight())

   useEffect(() => {
      setCanWatchAllHighlights(checkIfCanWatchHighlight())
   }, [userData?.badges, isEqual(deps, prevDeps)])

   /*
    * Here we set a cookie to expire in X milliseconds.
    * */
   const setUserTimeoutWithCookie = useCallback(() => {
      const timeFromNow = new Date(Date.now() + timoutDuration)
      setCookie(null, cookieName, timeFromNow.toUTCString(), {
         maxAge: timoutDuration,
      })
   }, [timoutDuration])

   return {
      canWatchAllHighlights,
      setUserTimeoutWithCookie,
      checkIfCanWatchHighlight,
      timoutDuration,
   }
}

export default useCanWatchHighlights
