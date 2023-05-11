import functions = require("firebase-functions")
import * as crypto from "crypto"
import { logAndThrow, validateUserAuthExists } from "./lib/validations"
import config from "./config"

const crispSecretKey = process.env.CRISP_SECRET_KEY

// Get crisp chat signature https://docs.crisp.chat/guides/chatbox-sdks/web-sdk/identity-verification/#how-to-setup-user-verification
// Not deployed, as we will only need it if we want to use crisp floating widget within the app
// which are not (we are only embedding an iframe in the streaming app atm).
export const getCrispSignature = functions
   .region(config.region)
   .https.onCall(async (data, context) => {
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
   })
