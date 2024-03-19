import { useAuth } from "HOCs/AuthProvider"
import { useSetUserIsParticipating } from "components/custom-hook/streaming/useSetUserIsParticipating"
import { useEffect } from "react"
import { useStreamingContext } from "../context"

export const ViewerTrackers = () => {
   const { userData, userStats } = useAuth()
   const { livestreamId } = useStreamingContext()

   const { setViewerIsParticipating, key } = useSetUserIsParticipating(
      livestreamId,
      userData,
      userStats
   )

   /**
    * Set the user as participating on mount
    */
   useEffect(() => {
      setViewerIsParticipating()
   }, [setViewerIsParticipating, key])

   return null
}
