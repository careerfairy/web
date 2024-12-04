import { useCallback, useState } from "react"
import { useLocalStorage } from "react-use"

const USER_HAND_RAISE_NOTICE_MAP = "handRaiseAck"

const MAX_ALLOWED_LENGTH = 15

/**
 * Custom hook which checks if the current user has seen the hand raise notice (red icon on the menu item) and allows adding data.
 * The data is stored in localStorage, with key @constant USER_HAND_RAISE_NOTICE_MAP and stores an array of live stream ids, with
 * first items allowing at maximum of @constant MAX_ALLOWED_LENGTH keys. The items are deleted upon reaching the limit in a
 * LIFO manner (the last added items are removed first when above the limit).
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

      updatedNotices.unshift(eventId)

      if (updatedNotices.length > MAX_ALLOWED_LENGTH) {
         updatedNotices = updatedNotices.slice(0, MAX_ALLOWED_LENGTH)
      }

      setNotices(updatedNotices)
      setHasNoticed(true)
   }, [notices, eventId, setNotices])

   return {
      setNoticed,
      hasNoticed,
   }
}
