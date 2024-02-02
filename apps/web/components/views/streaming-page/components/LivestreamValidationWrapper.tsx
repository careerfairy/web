import { useAuth } from "HOCs/AuthProvider"
import useLivestreamCategoryDataSWR from "components/custom-hook/live-stream/useLivestreamCategoryDataSWR"
import useLivestreamSecureTokenSWR from "components/custom-hook/live-stream/useLivestreamSecureToken"
import useRegisteredUsersSWR from "components/custom-hook/live-stream/useRegisteredUsersSWR"
import { useLivestreamData } from "components/custom-hook/streaming/useLivestreamData"
import { useConditionalRedirect } from "components/custom-hook/useConditionalRedirect"
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
   const { userData, isLoggedIn, authenticatedUser } = useAuth()

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

   const { data: registedredUsers } = useRegisteredUsersSWR({
      livestreamId: livestream.id,
   })

   const { data: hasAnswearedAllQuestions } = useLivestreamCategoryDataSWR(
      firebase,
      {
         livestream: livestream,
         userData: userData,
         breakoutRoomId: breakoutRoomId,
      }
   )

   console.log("🚀 ~ hasAllQuestions:", hasAnswearedAllQuestions)
   console.log("🚀 ~ registedredUsers:", registedredUsers)
   console.log("🚀 ~ isHost:", isHost)
   console.log("🚀 ~ token: " + livestreamToken.data + ", QS -> " + token)
   console.log("🚀 ~ userData:", userData)
   console.log(
      "🚀 ~ authenticatedUser  ~ isLoaded -> " +
         authenticatedUser.isLoaded +
         ", isLoggedIn -> " +
         isLoggedIn
   )
   if (livestreamExists) {
      // Since we're using suspense, if there's no live stream data, it means it doesn't exist
      return null
   }

   return <>{children}</>
}
