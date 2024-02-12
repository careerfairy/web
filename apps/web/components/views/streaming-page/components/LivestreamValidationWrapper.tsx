import { useAuth } from "HOCs/AuthProvider"
import AgoraRTC from "agora-rtc-sdk-ng"
import useLivestreamCategoryDataSWR from "components/custom-hook/live-stream/useLivestreamCategoryDataSWR"
import useLivestreamSecureTokenSWR from "components/custom-hook/live-stream/useLivestreamSecureToken"
import { useLivestreamData } from "components/custom-hook/streaming/useLivestreamData"
import { useConditionalRedirect } from "components/custom-hook/useConditionalRedirect"
import ConditionalWrapper from "components/util/ConditionalWrapper"
import LivestreamDialog from "components/views/livestream-dialog/LivestreamDialog"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import { useRouter } from "next/router"
import { ReactNode } from "react"

const isBrowserAgoraCompatible = AgoraRTC.checkSystemRequirements()

type LivestreamValidationWrapperProps = {
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
}: LivestreamValidationWrapperProps) => {
   return (
      <LivestreamExistenceWrapper>
         <LivestreamValidationsComponent isHost={isHost}>
            {children}
         </LivestreamValidationsComponent>
      </LivestreamExistenceWrapper>
   )
}

const LivestreamValidationsComponent = ({
   children,
   isHost,
}: LivestreamValidationWrapperProps) => {
   const { userData, isLoggedOut, authenticatedUser } = useAuth()
   const {
      query: { token },
      asPath,
      replace,
   } = useRouter()

   const firebase = useFirebaseService()

   const livestream = useLivestreamData()

   const livestreamToken = useLivestreamSecureTokenSWR(livestream.id)

   const { data: isUserRegistered, mutate: refetchQuestions } =
      useLivestreamCategoryDataSWR(firebase, {
         livestream: livestream,
         userData: userData,
      })

   // Custom validations

   const needsTokenValidation = isHost && !livestream.test

   const isInvalidToken =
      needsTokenValidation && token !== livestreamToken?.data?.value

   const needsToRegister = !isHost && !isUserRegistered

   const needsToBeLoggedIn =
      !isHost && isLoggedOut && !(livestream.test || livestream.openStream)

   useConditionalRedirect(isInvalidToken, "/streaming/error")

   if (needsToBeLoggedIn) {
      void replace({
         pathname: `/login`,
         query: { absolutePath: asPath },
      })
   }

   const afterRegistrationMutations = () => {
      refetchQuestions()
   }

   if (needsToRegister) {
      return (
         <LivestreamDialog
            open
            updatedStats={null}
            serverUserEmail={authenticatedUser.email}
            serverSideLivestream={livestream}
            livestreamId={livestream.id}
            handleClose={() => {}}
            page={"register"}
            mode="stand-alone"
            onRegisterSuccess={afterRegistrationMutations}
         />
      )
   }

   if (!isBrowserAgoraCompatible) {
      /**
       * TODO: Render compatibility error page
       */
      return <></>
   }

   if (isInvalidToken || needsToBeLoggedIn) {
      // Since we're using suspense, if there's no live stream data, it means it doesn't exist
      return null
   }

   return <>{children}</>
}

type LivestreamExistenceWrapperProps = {
   children: React.ReactNode
}
const LivestreamExistenceWrapper = ({
   children,
}: LivestreamExistenceWrapperProps) => {
   const livestream = useLivestreamData()

   const livestreamExists = Boolean(livestream)

   useConditionalRedirect(!livestreamExists, "/portal")

   return (
      <ConditionalWrapper condition={livestreamExists}>
         {children}
      </ConditionalWrapper>
   )
}
