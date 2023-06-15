import { useEffect, useState } from "react"
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
 * @param {boolean} shouldRedirect - Whether or not the hook should redirect.
 * @returns {boolean} - Whether or not the hook is currently redirecting.
 */
const useRedirectToEventRoom = (
   livestreamPresenter: LivestreamPresenter,
   shouldRedirect: boolean = true
) => {
   const { authenticatedUser, isLoadingAuth } = useAuth()
   const { replace } = useRouter()
   const [isRedirecting, setIsRedirecting] = useState(false)

   useEffect(() => {
      if (isRedirecting || !livestreamPresenter || !shouldRedirect) return
      if (
         !isLoadingAuth &&
         livestreamPresenter.isLive() &&
         livestreamPresenter.isUserRegistered(authenticatedUser.email)
      ) {
         setIsRedirecting(true)
         void replace(livestreamPresenter.getViewerEventRoomLink()).finally(
            () => {
               setIsRedirecting(false)
            }
         )
      }
      return () => {
         setIsRedirecting(false)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [
      replace,
      livestreamPresenter,
      authenticatedUser.email,
      isLoadingAuth,
      shouldRedirect,
   ])

   return isRedirecting
}

export default useRedirectToEventRoom
