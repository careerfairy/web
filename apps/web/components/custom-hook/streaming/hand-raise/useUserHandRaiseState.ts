import {
   HandRaise,
   HandRaiseState,
} from "@careerfairy/shared-lib/livestreams/hand-raise"
import { useMemo } from "react"
import { ReactFireOptions } from "reactfire"
import { useFirestoreDocument } from "../../utils/useFirestoreDocument"

const reactFireOptions: ReactFireOptions = {
   suspense: true,
   idField: "id",
}

type UseUserHandRaiseState = {
   /**
    * Whether the hand raise is active, i.e. the hand raise state is not unrequested or denied or loading
    */
   isActive: boolean
   /**
    * Whether the hand raise state is loading
    */
   isLoading: boolean
   /**
    * The error that occurred while fetching the hand raise state
    */
   error: Error | null
   /**
    * The hand raise document
    */
   handRaise: HandRaise | null
}

export const useUserHandRaiseState = (
   livestreamId: string,
   agoraUserId: string
): UseUserHandRaiseState => {
   const {
      data: handRaise,
      error,
      status,
   } = useFirestoreDocument<HandRaise>(
      "livestreams",
      [livestreamId, "handRaises", agoraUserId],
      reactFireOptions
   )

   return useMemo<UseUserHandRaiseState>(() => {
      const isActive =
         handRaise?.state &&
         handRaise.state !== HandRaiseState.unrequested &&
         handRaise.state !== HandRaiseState.denied

      return {
         isActive,
         isLoading: status === "loading",
         error,
         handRaise,
      }
   }, [handRaise, status, error])
}
