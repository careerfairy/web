import useLivestreamSecureTokenSWR from "components/custom-hook/live-stream/useLivestreamSecureToken"
import { useLivestreamData } from "components/custom-hook/streaming/useLivestreamData"
import { useConditionalRedirect } from "components/custom-hook/useConditionalRedirect"
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
   console.log("🚀 ~ isHost:", isHost)
   const livestream = useLivestreamData()

   const livestreamExists = Boolean(livestream)

   useConditionalRedirect(!livestreamExists, "/portal")

   const token = useLivestreamSecureTokenSWR({ livestreamId: livestream.id })
   console.log("🚀 ~ token:", token)
   if (!livestreamExists) {
      // Since we're using suspense, if there's no live stream data, it means it doesn't exist
      return null
   }

   return <>{children}</>
}
