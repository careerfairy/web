import { useCallback, useState } from "react"
import { useLocalStorage } from "react-use"

const USER_HAND_RAISE_NOTICE_MAP = "handRaiseAck"

const MAX_ALLOWED_LENGTH = 15

/**
 * Custom hook which checks if the current user has seen the hand raise notice (red icon on the menu item) and allows adding data.
 * The data is stored in localStorage, with key @constant USER_HAND_RAISE_NOTICE_MAP and stores a map of live stream ids
 * numerical value which is the date the notice was acknowledge in epoch seconds, allowing at maximum of @constant MAX_ALLOWED_LENGTH keys.
 * @param eventId Id of the live stream to be checked and store if noticed.
 */
export const useUserHasNoticedHandRaise = (eventId: string) => {
   const [notices, setNotices] = useLocalStorage<string[]>(
      USER_HAND_RAISE_NOTICE_MAP,
      []
   )
   const [hasNoticed, setHasNoticed] = useState(notices.includes(eventId))

   const setNoticed = useCallback(() => {
      let updatedNotices = [...notices]

      if (notices.length > MAX_ALLOWED_LENGTH - 1) {
         updatedNotices = updatedNotices.slice(0, MAX_ALLOWED_LENGTH - 1)
      }

      updatedNotices.push(eventId)

      setNotices(updatedNotices)
      setHasNoticed(true)
   }, [notices, eventId, setNotices])

   return {
      setNoticed,
      hasNoticed,
   }
}
