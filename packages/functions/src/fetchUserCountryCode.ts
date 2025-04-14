import { onCall } from "firebase-functions/https"
import { getCountryCode } from "./util"

export const fetchUserCountryCode = onCall(getCountryCode)
