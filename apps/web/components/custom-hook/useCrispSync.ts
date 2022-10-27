import { useEffect } from "react"
import useCrispSignature from "./useCrispSignature"
import { setCrispEmail } from "../../scripts/crisp"
import { FirebaseReducer } from "react-redux-firebase"

const useCrispSync = (user: FirebaseReducer.AuthState) => {
   const data = useCrispSignature(user.email)

   useEffect(() => {
      window.CRISP_TOKEN_ID = user?.uid || ""
   }, [user?.uid])

   useEffect(() => {
      // Update the signature if the user changes
      if (data?.email && data?.signature) {
         // https://docs.crisp.chat/guides/chatbox-sdks/web-sdk/identity-verification/ (set email)
         setCrispEmail(data.email, data.signature)
      }
   }, [data?.email, data?.signature])

   return null
}

export default useCrispSync
