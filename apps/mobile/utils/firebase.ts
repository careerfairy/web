import { httpsCallable } from "firebase/functions"
import { functions } from "../firebase"

type VerifyTokenResult = {
   uid: string
   email: string
   claims: Record<string, any>
   customToken: string
}

export const handleVerifyToken = async (
   idToken: string
): Promise<VerifyTokenResult> => {
   const verifyTokenFn = httpsCallable<{ idToken: string }, VerifyTokenResult>(
      functions,
      "verifyToken"
   )
   const result = await verifyTokenFn({ idToken })
   return result.data
}
