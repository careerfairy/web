import { livestreamRepo } from "data/RepositoryInstances"
import { useAuth } from "HOCs/AuthProvider"
import { useCallback } from "react"
import useSWR, { useSWRConfig } from "swr"
import { errorLogAndNotify } from "util/CommonUtil"

const useRegisteredStreams = () => {
   const { authenticatedUser } = useAuth()

   return useSWR(
      authenticatedUser.email
         ? ["user-registered-streams", authenticatedUser.email]
         : null,
      async ([, email]) => livestreamRepo.getRegisteredEvents(email),
      {
         onError: (error) => {
            errorLogAndNotify(error, {
               message: "Failed to fetch registered streams",
               userId: authenticatedUser.uid,
            })
         },
      }
   )
}

export const useRefetchRegisteredStreams = () => {
   const { authenticatedUser } = useAuth()
   const { mutate } = useSWRConfig()

   return useCallback(() => {
      if (authenticatedUser?.email) {
         mutate(["user-registered-streams", authenticatedUser.email])
      }
   }, [authenticatedUser?.email, mutate])
}

export default useRegisteredStreams
