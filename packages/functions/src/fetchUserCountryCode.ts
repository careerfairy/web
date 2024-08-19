import * as functions from "firebase-functions"
import config from "./config"
import { getCountryCode } from "./util"

export const fetchUserCountryCode = functions
   .region(config.region)
   .https.onCall((_, context) => {
      return getCountryCode(context)
   })
