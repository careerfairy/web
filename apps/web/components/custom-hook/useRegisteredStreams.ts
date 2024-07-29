import { livestreamService } from "data/firebase/LivestreamService"
import { useAuth } from "HOCs/AuthProvider"
import { useCallback } from "react"
import useSWR, { useSWRConfig } from "swr"

const useRegisteredStreams = () => {
   const { authenticatedUser } = useAuth()

   return useSWR(
      authenticatedUser.uid
         ? ["user-registered-streams", authenticatedUser.uid]
         : null,
      async ([, uid]) => livestreamService.getRegisteredStreams(uid)
   )
}

export const useRefetchRegisteredStreams = () => {
   const { authenticatedUser } = useAuth()
   const { mutate } = useSWRConfig()

   return useCallback(() => {
      if (authenticatedUser?.uid) {
         mutate(["user-registered-streams", authenticatedUser.uid])
      }
   }, [authenticatedUser?.uid, mutate])
}

export default useRegisteredStreams
