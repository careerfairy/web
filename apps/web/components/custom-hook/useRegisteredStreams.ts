import { livestreamRepo } from "data/RepositoryInstances"
import { useAuth } from "HOCs/AuthProvider"
import { useCallback } from "react"
import useSWR, { useSWRConfig } from "swr"

const useRegisteredStreams = () => {
   const { authenticatedUser } = useAuth()

   return useSWR(
      authenticatedUser.uid
         ? ["user-registered-streams", authenticatedUser.email]
         : null,
      async ([, email]) => livestreamRepo.getRegisteredEvents(email)
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
