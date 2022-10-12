import functions = require("firebase-functions")
import * as crypto from "crypto"
import { logAndThrow, validateUserAuthExists } from "./lib/validations"

const crispSecretKey = process.env.CRISP_SECRET_KEY

// Get crisp chat signature
export const getCrispSignature = functions.https.onCall(
   async (data, context) => {
      try {
         const token = await validateUserAuthExists(context)
         const { email } = token

         const signature = crypto
            .createHmac("sha256", crispSecretKey)
            .update(email)
            .digest("hex")

         return { signature, email }
      } catch (error) {
         logAndThrow(error, {
            message: "Error getting crisp signature",
            data,
            context,
         })
         return null
      }
   }
)
