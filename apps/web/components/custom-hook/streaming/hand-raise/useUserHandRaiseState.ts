import {
   HandRaise,
   isHandRaiseActive,
   isUserCanJoinPanel,
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
    * Whether the hand raise is active, aquiring_media, requested, invited, connecting and connected
    */
   userHandRaiseIsActive: boolean
   /**
    * Whether the viewer should join the panel with the hosts without need to request once more
    */
   userCanJoinPanel: boolean
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
      return {
         userHandRaiseIsActive: isHandRaiseActive(handRaise),
         userCanJoinPanel: isUserCanJoinPanel(handRaise),
         isLoading: status === "loading",
         error,
         handRaise,
      }
   }, [handRaise, status, error])
}
