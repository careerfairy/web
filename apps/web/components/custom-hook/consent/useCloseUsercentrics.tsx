import { useRouter } from "next/router"
import { useEffect } from "react"
import { closePrivacyWall } from "util/ConsentUtils"

/**
 * Close the Usercentrics dialog if we're on a recording session
 */
export const useCloseUsercentrics = () => {
   const { query } = useRouter()
   useEffect(() => {
      let interval: NodeJS.Timeout
      if (query.isRecordingWindow) {
         closePrivacyWall()

         let tries = 7
         // just to be completely sure there isn't a race condition anywhere
         // try to close the dialog after some seconds as well
         interval = setInterval(() => {
            closePrivacyWall()
            if (--tries <= 0) {
               clearInterval(interval)
            }
         }, 1000)
      }

      return () => {
         clearInterval(interval)
      }
   }, [query.isRecordingWindow])
}
