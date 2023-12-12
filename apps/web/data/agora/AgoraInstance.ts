import { shouldUseEmulators } from "../../util/CommonUtil"

// Project: Production
let appID = process.env.AGORA_APP_ID
console.log("WG-TBD-ENV: " + JSON.stringify(process.env))
if (shouldUseEmulators()) {
   // Project: CareerFairyStreaming

   console.log("Using AgoraSDK testing environment")
}

export const agoraCredentials = {
   appID,
}
