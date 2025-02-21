import { FIREBASE_PROJECT_ID } from "@env"
import { FUNCTIONS_REGION } from "../firebase"

const FUNCTIONS_DOMAIN = `https://${FUNCTIONS_REGION}-${FIREBASE_PROJECT_ID}.cloudfunctions.net`

type VerifyTokenResult = {
   uid: string
   email: string
   claims: Record<string, any>
   customToken: string
}

export const handleVerifyToken = async (
   idToken: string
): Promise<VerifyTokenResult> => {
   const response = await fetch(`${FUNCTIONS_DOMAIN}/verifyToken`, {
      method: "POST",
      headers: {
         "Content-Type": "application/json",
      },
      body: JSON.stringify({ idToken }),
   })

   if (!response.ok) {
      throw new Error("Failed to verify token")
   }

   return response.json()
}
