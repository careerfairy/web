import { useAuth } from "HOCs/AuthProvider"
import AgoraRTC from "agora-rtc-sdk-ng"
import useLivestreamCategoryDataSWR from "components/custom-hook/live-stream/useLivestreamCategoryDataSWR"
import useLivestreamSecureTokenSWR from "components/custom-hook/live-stream/useLivestreamSecureToken"
import useRegisteredUsersSWR from "components/custom-hook/live-stream/useRegisteredUsersSWR"
import { useLivestreamData } from "components/custom-hook/streaming/useLivestreamData"
import { useConditionalRedirect } from "components/custom-hook/useConditionalRedirect"
import LivestreamDialog from "components/views/livestream-dialog/LivestreamDialog"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import { useRouter } from "next/router"
import { ReactNode } from "react"

const isBrowserAgoraCompatible = AgoraRTC.checkSystemRequirements()

type ConditionalRedirectWrapperProps = {
   children: ReactNode
   isHost?: boolean
}

/**
 * All validation logic for the live stream data is handled here.
 * Ensures all the children have the data needed without having to check for it in each component.
 *
 * TODO:
 * - Validate token if user is host and not test stream
 * - Validate user must be logged-in except for (test/open) streams
 * - Validate if viewer and has registered for event
 * - Validate browser is compatible with Agora
 */
export const LivestreamValidationWrapper = ({
   children,
   isHost,
}: ConditionalRedirectWrapperProps) => {
   const redirectAs = isHost ? "host" : "viewer"

   const { userData, isLoggedIn, authenticatedUser, isLoggedOut } = useAuth()

   const {
      query: { breakoutRoomId, token },
   } = useRouter()

   const firebase = useFirebaseService()

   const livestream = useLivestreamData()

   const livestreamExists = Boolean(livestream)

   useConditionalRedirect(!livestreamExists, "/portal")

   const livestreamToken = useLivestreamSecureTokenSWR({
      livestreamId: livestream.id,
   })

   const { data: registeredUsers, mutate: refetchRegisteredUsers } =
      useRegisteredUsersSWR({
         livestreamId: livestream.id,
      })

   const { data: hasAnswearedAllQuestions, mutate: refetchQuestions } =
      useLivestreamCategoryDataSWR(firebase, {
         livestream: livestream,
         userData: userData,
         breakoutRoomId: breakoutRoomId,
      })

   // Custom validations
   // 1. user is a host and the stream is not a test stream -> accessible
   const isHostNotTestLivestream = isHost && !livestream.test
   // 2. user is a host and the stream is not a test stream, invalid link -> /streaming/error page
   const isHostNotTestStreamInvalidLink =
      isHostNotTestLivestream && token !== livestreamToken?.data?.value
   // 3. user is logged out,test or open stream -> accessible
   const isLoggedOutTestOpenStream =
      isLoggedOut && (livestream.test || livestream.openStream)
   // 4. user is logged out, not test or open stream -> not accessible, login/redirectUri
   const isLoggedOutNotTestOpenStream =
      isLoggedOut && !(livestream.test || livestream.openStream)
   // 5. user is a viewer and has registered for the event -> accessible
   const isViewerRegistered =
      !isHost &&
      isLoggedIn &&
      registeredUsers?.includes(authenticatedUser.email)
   // 6. user is a viewer and has not registered for the event -> registration dialog
   const isViewerNotRegistered =
      !isHost &&
      authenticatedUser.isLoaded &&
      isLoggedIn &&
      !registeredUsers?.includes(authenticatedUser.email) // Redirect register

   useConditionalRedirect(isHostNotTestStreamInvalidLink, "/streaming/error")

   const encodedPath = encodeURIComponent(
      `streaming/${redirectAs}/${livestream.id}`
   )
   useConditionalRedirect(
      isLoggedOutNotTestOpenStream,
      `/login?absolutePath=${encodedPath}`
   )

   const afterRegistrationMutations = () => {
      refetchRegisteredUsers()
      refetchQuestions()
   }
   const allowRules = [
      isHostNotTestLivestream,
      isLoggedOutTestOpenStream,
      isViewerRegistered,
   ]

   const allow = Boolean(allowRules.find(Boolean))

   if (isViewerNotRegistered) {
      return (
         <>
            <LivestreamDialog
               open={true}
               updatedStats={null}
               serverUserEmail={authenticatedUser.email}
               livestreamId={livestream.id}
               handleClose={() => {}}
               page={"details"}
               mode="stand-alone"
               onRegisterSuccess={afterRegistrationMutations}
            />
         </>
      )
   }

   if (!allow || !isBrowserAgoraCompatible || !hasAnswearedAllQuestions) {
      // Since we're using suspense, if there's no live stream data, it means it doesn't exist
      return null
   }

   return <>{children}</>
}
