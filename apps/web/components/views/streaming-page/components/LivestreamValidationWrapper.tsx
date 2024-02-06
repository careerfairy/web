import { useAuth } from "HOCs/AuthProvider"
import AgoraRTC from "agora-rtc-sdk-ng"
import useLivestreamCategoryDataSWR from "components/custom-hook/live-stream/useLivestreamCategoryDataSWR"
import useLivestreamSecureTokenSWR from "components/custom-hook/live-stream/useLivestreamSecureToken"
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
 */
export const LivestreamValidationWrapper = ({
   children,
   isHost,
}: ConditionalRedirectWrapperProps) => {
   const { userData, isLoggedIn, isLoggedOut, authenticatedUser } = useAuth()
   const {
      query: { token },
      asPath,
      replace,
   } = useRouter()

   const firebase = useFirebaseService()

   const livestream = useLivestreamData()

   const livestreamExists = Boolean(livestream)

   useConditionalRedirect(!livestreamExists, "/portal")

   const livestreamToken = useLivestreamSecureTokenSWR({
      livestreamId: livestream?.id,
   })

   const { data: hasAnswearedAllQuestions, mutate: refetchQuestions } =
      useLivestreamCategoryDataSWR(firebase, {
         livestream: livestream,
         userData: userData,
      })

   // Custom validations

   const isUserRegistered = livestream?.registeredUsers?.includes(
      authenticatedUser.email
   )

   // 1. user is a host and the stream is not a test stream -> accessible
   const isHostNotTestLivestream = isHost && !livestream?.test

   // 2. user is a host and the stream is not a test stream, invalid link -> /streaming/error page
   const isHostNotTestStreamInvalidLink =
      isHostNotTestLivestream &&
      Boolean(token) &&
      token !== livestreamToken?.data?.value

   // 3. user is logged out,test or open stream -> accessible
   const isLoggedOutTestOpenStream =
      isLoggedOut && (livestream?.test || livestream?.openStream)

   // 4. user is logged out, not test or open stream -> not accessible, login/redirectUri
   const isLoggedOutNotTestOpenStream =
      isLoggedOut && !(livestream?.test || livestream?.openStream)

   // 5. user is a viewer and has registered for the event -> accessible
   const isViewerRegistered = !isHost && isLoggedIn && isUserRegistered

   // 6. user is a viewer and has not registered for the event -> registration dialog
   const isViewerNotRegistered = !isHost && isLoggedIn && !isUserRegistered // Redirect register

   useConditionalRedirect(isHostNotTestStreamInvalidLink, "/streaming/error")

   if (isLoggedOutNotTestOpenStream) {
      void replace({
         pathname: `/login`,
         query: { absolutePath: asPath },
      })
   }

   const afterRegistrationMutations = () => {
      refetchQuestions()
   }
   const allowRules = [
      isHostNotTestLivestream,
      isLoggedOutTestOpenStream,
      isViewerRegistered,
   ]

   const allow = Boolean(allowRules.find(Boolean))

   if (!allow && isViewerNotRegistered) {
      return (
         <>
            <LivestreamDialog
               open
               updatedStats={null}
               serverUserEmail={authenticatedUser.email}
               serverSideLivestream={livestream}
               livestreamId={livestream?.id}
               handleClose={() => {}}
               page={"register"}
               mode="stand-alone"
               onRegisterSuccess={afterRegistrationMutations}
            />
         </>
      )
   }

   if (
      !allow ||
      !isBrowserAgoraCompatible ||
      (isUserRegistered && !hasAnswearedAllQuestions)
   ) {
      // Since we're using suspense, if there's no live stream data, it means it doesn't exist
      return null
   }

   return <>{children}</>
}
