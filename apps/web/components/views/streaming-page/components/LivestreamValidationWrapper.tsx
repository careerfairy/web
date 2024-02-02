import { useAuth } from "HOCs/AuthProvider"
import AgoraRTC from "agora-rtc-sdk-ng"
import useLivestreamCategoryDataSWR from "components/custom-hook/live-stream/useLivestreamCategoryDataSWR"
import useLivestreamSecureTokenSWR from "components/custom-hook/live-stream/useLivestreamSecureToken"
import useRegisteredUsersSWR from "components/custom-hook/live-stream/useRegisteredUsersSWR"
import { useLivestreamData } from "components/custom-hook/streaming/useLivestreamData"
import { useConditionalRedirect } from "components/custom-hook/useConditionalRedirect"
import useRegistrationModal from "components/custom-hook/useRegistrationModal"
import RegistrationModal from "components/views/common/registration-modal"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import { useRouter } from "next/router"
import { ReactNode } from "react"

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
   const { joinGroupModalData, handleCloseJoinModal } = useRegistrationModal()
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
   console.log("🚀 ~ questions: ", hasAnswearedAllQuestions)
   // Custom validations
   console.log("🚀 ~  ~ Custom validations ~  ~ ")

   // 1. user is a host and the stream is not a test stream -> accessible
   const isHostNotTestLivestream = isHost && !livestream.test
   console.log("🚀 ~ isHostNotTestLivestream:", isHostNotTestLivestream)

   // 2. user is a host and the stream is not a test stream, invalid link -> /streaming/error page
   // TODO: Confirm what is invalid link ? Token validation only ?
   const isHostNotTestStreamInvalidLink =
      isHostNotTestLivestream && token !== livestreamToken?.data
   console.log(
      "🚀 ~ isHostNotTestLivestreamInvalidLink:",
      isHostNotTestStreamInvalidLink
   )

   // 3. user is logged out,test or open stream -> accessible
   const isLoggedOutTestOpenStream =
      authenticatedUser.isLoaded &&
      isLoggedOut &&
      (livestream.test || livestream.openStream)
   console.log("🚀 ~ isLoggedOutTestOpenStream:", isLoggedOutTestOpenStream)

   // 4. user is logged out, not test or open stream -> not accessible, /streaming/error page ?
   // TODO: Confirm redirect to error or nothing ?
   // TODO: Check if isLoggedOut needs isLoaded
   const isLoggedOutNotTestOpenStream =
      isLoggedOut && !(livestream.test || livestream.openStream)
   console.log(
      "🚀 ~ isLoggedOutNotTestOpenStream:",
      isLoggedOutNotTestOpenStream
   )

   // 5. user is a viewer and has registered for the event -> accessible
   const isViewerRegistered =
      !isHost &&
      authenticatedUser.isLoaded &&
      isLoggedIn &&
      registeredUsers?.includes(authenticatedUser.email)
   console.log("🚀 ~ isViewerRegistered:", isViewerRegistered)

   // 6. user is a viewer and has not registered for the event -> registration dialog
   const isViewerNotRegistered =
      !isHost &&
      authenticatedUser.isLoaded &&
      isLoggedIn &&
      !registeredUsers?.includes(authenticatedUser.email) // Redirect register
   console.log("🚀 ~ isViewerNotRegistered:", isViewerNotRegistered)

   // 7. user is using a browser that is compatible with Agora
   const isBrowserAgoraCompatible = AgoraRTC.checkSystemRequirements()
   console.log("🚀 ~ isBrowserAgoraCompatible:", isBrowserAgoraCompatible)

   useConditionalRedirect(
      livestreamExists &&
         (isHostNotTestStreamInvalidLink || isLoggedOutNotTestOpenStream),
      "/streaming/error"
   )

   const afterRegistrationMutations = () => {
      console.log("🚀 ~ user Registration finished - mutating")
      refetchRegisteredUsers()
      refetchQuestions()
   }

   const allow =
      [
         isHostNotTestLivestream,
         isLoggedOutTestOpenStream,
         isViewerRegistered,
      ].find(Boolean) !== undefined
   console.log("🚀 ~ allow:", allow)

   if (isViewerNotRegistered) {
      return (
         <>
            <RegistrationModal
               open
               onFinish={afterRegistrationMutations}
               livestream={livestream}
               groups={joinGroupModalData?.groups}
               handleClose={handleCloseJoinModal}
            />
         </>
      )
   }

   if (!livestreamExists || !allow || !isBrowserAgoraCompatible) {
      // Since we're using suspense, if there's no live stream data, it means it doesn't exist
      return null
   }

   return <>{children}</>
}
