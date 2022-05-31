import { useCallback, useEffect, useState } from "react"
import { parseCookies, setCookie, destroyCookie } from "nookies"
import { getMillisecondsBetweenDates } from "../../util/CommonUtil"
import { useAuth } from "../../HOCs/AuthProvider"
import { useInterval } from "react-use"

const oneDayInMilliseconds = 24 * 60 * 60 * 1000
export const timeoutDuration: number = oneDayInMilliseconds

const cookieName: string = "canWatchHighlights"
interface Props {
   // How long you want to wait before you can watch again in milliseconds
   timoutDuration?: number
}

const useCanWatchHighlights = () => {
   const { userPresenter, userData, isLoggedIn } = useAuth()

   /*
    * Check if the user can watch highlights.
    * - If they can, we return {canWatchAll: true, timeLeft: 0}
    * - If they can't, we return {canWatchAll: false, timeLeft: timeLeft}
    * */
   const checkIfCanWatchHighlight = () => {
      let data = { canWatchAll: true, timeLeft: 0 }
      const canWatch = userPresenter?.canWatchAllHighlights()
      if (!canWatch || !userPresenter) {
         const cookies = parseCookies()
         const cookieExpiry = cookies[cookieName]
         if (cookieExpiry) {
            const cookieExpiryDate = new Date(cookieExpiry)
            const now = new Date()
            data = {
               canWatchAll: now > cookieExpiryDate,
               // Return the time left until the user can watch highlights again in milliseconds
               timeLeft: getMillisecondsBetweenDates(cookieExpiryDate, now),
            }
         }
      }
      // If we don't have a cookie, we can watch all highlights
      return data
   }

   const [canWatchAllHighlights, setCanWatchAllHighlights] =
      useState<CanWatchHighlightsProps>(checkIfCanWatchHighlight())

   useInterval(
      () => {
         handleCheckIfCanWatchHighlight()
      },
      // Check every twenty seconds if the user can watch highlights
      20000
   )

   const handleCheckIfCanWatchHighlight = useCallback(() => {
      const data = checkIfCanWatchHighlight()
      setCanWatchAllHighlights(data)
      return data
   }, [checkIfCanWatchHighlight])

   useEffect(() => {
      handleCheckIfCanWatchHighlight()
   }, [userData?.badges, userPresenter, isLoggedIn])

   /*
    * Here we set a cookie to expire in X milliseconds.
    * */
   const setUserTimeoutWithCookie = useCallback(() => {
      if (userPresenter?.canWatchAllHighlights()) {
         // If the user can watch all highlights, we don't need to set/re-set a cookie
         return
      }
      const timeFromNow = new Date(Date.now() + timeoutDuration)
      setCookie(null, cookieName, timeFromNow.toUTCString(), {
         maxAge: timeoutDuration,
         expires: timeFromNow,
      })
   }, [timeoutDuration, userData?.badges])

   return {
      canWatchAllHighlights,
      setUserTimeoutWithCookie,
      handleCheckIfCanWatchHighlight,
      timeoutDuration,
   }
}

export default useCanWatchHighlights
