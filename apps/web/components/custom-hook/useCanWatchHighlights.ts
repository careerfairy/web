import { useCallback, useEffect, useState } from "react"
import { parseCookies, setCookie } from "nookies"
import { getMillisecondsBetweenDates } from "../../util/CommonUtil"
import { useAuth } from "../../HOCs/AuthProvider"
import { useInterval } from "react-use"

const timeOut: number = 30000
const cookieName: string = "canWatchHighlights"
interface Props {
   // How long you want to wait before you can watch again in milliseconds
   timoutDuration?: number
}

export interface CanWatchHighlightsProps {
   canWatchAll: boolean
   timeLeft: number
}
const useCanWatchHighlights = ({ timoutDuration = timeOut }: Props = {}) => {
   const { userPresenter, userData } = useAuth()

   /*
    * Check if the user can watch highlights.
    * - If they can, we return {canWatchAll: true, timeLeft: 0}
    * - If they can't, we return {canWatchAll: false, timeLeft: timeLeft}
    * */
   const checkIfCanWatchHighlight = useCallback(() => {
      let data = { canWatchAll: true, timeLeft: 0 }
      const canWatch = userPresenter?.canWatchAllHighlights()
      if (!canWatch) {
         const cookies = parseCookies()
         const cookieExpiry = cookies[cookieName]
         if (cookieExpiry) {
            const cookieExpiryDate = new Date(cookieExpiry)
            const now = new Date()
            data = {
               canWatchAll: now > cookieExpiryDate,
               timeLeft: getMillisecondsBetweenDates(cookieExpiryDate, now),
            }
         }
      }
      // If we don't have a cookie, we can watch all highlights
      return data
   }, [userData?.badges, userPresenter])

   const [canWatchAllHighlights, setCanWatchAllHighlights] =
      useState<CanWatchHighlightsProps>(checkIfCanWatchHighlight())

   useInterval(
      () => {
         setCanWatchAllHighlights(checkIfCanWatchHighlight())
      },
      canWatchAllHighlights.canWatchAll ? 1000 : timoutDuration
   )

   useEffect(() => {
      setCanWatchAllHighlights(checkIfCanWatchHighlight())
   }, [userData?.badges, userPresenter])

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
