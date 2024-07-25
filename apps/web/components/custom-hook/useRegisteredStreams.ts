import { livestreamService } from "data/firebase/LivestreamService"
import { useAuth } from "HOCs/AuthProvider"
import useSWR from "swr"

type Options = {
   limit?: number
}

const useRegisteredStreams = (props: Options = {}) => {
   const { limit = 20 } = props
   const { authenticatedUser } = useAuth()

   return useSWR(
      authenticatedUser.uid
         ? ["user-registered-streams", authenticatedUser.uid, limit]
         : null,
      async ([, uid, numberToFetch]) =>
         livestreamService.getRegisteredStreams(uid, numberToFetch)
   )
}

export default useRegisteredStreams
