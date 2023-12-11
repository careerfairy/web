import { shouldUseEmulators } from "../../util/CommonUtil"

// Project: Production
let appID = process.env.AGORA_APP_ID

if (shouldUseEmulators()) {
   // Project: CareerFairyStreaming

   console.log("Using AgoraSDK testing environment")
}

export const agoraCredentials = {
   appID,
}
