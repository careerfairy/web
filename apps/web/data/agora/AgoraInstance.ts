import { shouldUseEmulators } from "../../util/CommonUtil"

// Project: Production
let appID = process.env.AGORA_PRIVATE_PROD_APP_ID

if (shouldUseEmulators()) {
   // Project: CareerFairyStreaming
   appID = process.env.NEXT_PRIVATE_DEV_AGORA_APP_ID

   console.log("Using AgoraSDK testing environment")
}

export const agoraCredentials = {
   appID,
}
