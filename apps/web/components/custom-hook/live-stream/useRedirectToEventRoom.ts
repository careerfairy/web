import { useEffect, useRef } from "react"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import { useAuth } from "../../../HOCs/AuthProvider"
import { useRouter } from "next/router"

/**
 * Custom React Hook to handle redirection to a Livestream Event room.
 *
 * This hook checks the state of the provided livestream. If the livestream has started,
 * it will trigger a route change to send the user to the viewer page for that livestream event.
 *
 * @param {LivestreamPresenter} livestreamPresenter - The livestream presenter object.
 * @returns {null} Returns null. The hook does not return any values, its purpose is to perform side effects.
 */
const useRedirectToEventRoom = (livestreamPresenter?: LivestreamPresenter) => {
   const { authenticatedUser, isLoadingAuth } = useAuth()
   const { replace } = useRouter()
   const isRedirecting = useRef(false)

   useEffect(() => {
      if (
         !isLoadingAuth &&
         livestreamPresenter.isLive() &&
         livestreamPresenter.isUserRegistered(authenticatedUser.email)
      ) {
         isRedirecting.current = true
         void replace(livestreamPresenter.getViewerEventRoomLink())
      }
      return () => {
         isRedirecting.current = false
      }
   }, [
      replace,
      livestreamPresenter?.isLive,
      livestreamPresenter?.id,
      authenticatedUser?.email,
      isLoadingAuth,
   ])
}

export default useRedirectToEventRoom
