// Project: Production
let appID = "53675bc6d3884026a72ecb1de3d19eb1"

if (process.env.NEXT_PUBLIC_FIREBASE_EMULATORS) {
   // Project: CareerFairyStreaming
   appID = "52e732c40bf94a8c97fdd0fd443210e0"

   console.log("Using AgoraSDK testing environment")
}

export const agoraCredentials = {
   appID,
}
