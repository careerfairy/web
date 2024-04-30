import { HandRaise } from "@careerfairy/shared-lib/livestreams/hand-raise"
import { ReactFireOptions } from "reactfire"
import { useFirestoreDocument } from "../../utils/useFirestoreDocument"

const reactFireOptions: ReactFireOptions = {
   suspense: true,
   idField: "id",
}

export const useUserHandRaiseState = (
   livestreamId: string,
   agoraUserId: string
) => {
   return useFirestoreDocument<HandRaise>(
      "livestreams",
      [livestreamId, "handRaises", agoraUserId],
      reactFireOptions
   )
}
