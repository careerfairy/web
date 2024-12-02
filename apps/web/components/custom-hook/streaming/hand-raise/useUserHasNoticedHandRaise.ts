import { DateTime } from "luxon"
import { useCallback, useState } from "react"
import { useLocalStorage } from "react-use"

const USER_HAND_RAISE_NOTICE_MAP = "handRaiseAck"

const MAX_ALLOWED_LENGTH = 15

export const useUserHasNoticedHandRaise = (eventId: string) => {
   const [notices, setNotices] = useLocalStorage<Record<string, number>>(
      USER_HAND_RAISE_NOTICE_MAP,
      {}
   )
   const [hasNoticed, setHasNoticed] = useState(Boolean(notices[eventId]))

   const setNoticed = useCallback(() => {
      const noticeKeys = Object.keys(notices)
      const newNotices = { ...notices }
      if (noticeKeys.length > MAX_ALLOWED_LENGTH) {
         noticeKeys
            .sort((keyA, keyB) => notices[keyB] - notices[keyA])
            .filter((_, idx) => idx >= MAX_ALLOWED_LENGTH)
            .forEach((eventKey) => {
               delete newNotices[eventKey]
            })
      }
      newNotices[eventId] = DateTime.now().toUnixInteger()
      setNotices(newNotices)
      setHasNoticed(true)
   }, [notices, eventId, setNotices])

   return {
      setNoticed,
      hasNoticed,
   }
}
