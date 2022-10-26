import { UserLivestreamData } from "@careerfairy/shared-lib/dist/livestreams"
import { useAuth } from "../../HOCs/AuthProvider"
import { useEffect, useState } from "react"
import { livestreamRepo } from "../../data/RepositoryInstances"
import { errorLogAndNotify } from "../../util/CommonUtil"

/**
 * Fetch the livestream UserLivestreamData document
 * @param livestreamId
 */
const useUserLivestreamData = (livestreamId): [boolean, UserLivestreamData] => {
   const { isLoggedIn, userData } = useAuth()
   // undefined = loading
   // null => finished loading, no user
   const [fetchedUser, setFetchedUser] = useState<UserLivestreamData>(undefined)

   useEffect(() => {
      let isMounted = true

      if (!userData) {
         setFetchedUser(null)
         return
      }

      livestreamRepo
         .getLivestreamUser(livestreamId, userData.userEmail)
         .then((data) => {
            if (isMounted) {
               setFetchedUser(data)
            }
         })
         .catch((e) => {
            errorLogAndNotify(e)
            if (isMounted) {
               setFetchedUser(null)
            }
         })

      return () => {
         isMounted = false
      }
   }, [isLoggedIn, livestreamId, userData])

   // [isLoading, user]
   return [fetchedUser === undefined, fetchedUser]
}

export default useUserLivestreamData
