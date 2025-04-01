import * as functions from "firebase-functions"
import { getCountryCode } from "./util"

export const fetchUserCountryCode = functions.https.onCall((_, context) => {
   return getCountryCode(context)
})
