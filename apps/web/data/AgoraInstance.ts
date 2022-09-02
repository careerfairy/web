// Project: Production
import AgoraRTC, { ClientConfig, IAgoraRTCClient } from "agora-rtc-sdk-ng"

let appID = "53675bc6d3884026a72ecb1de3d19eb1"

if (process.env.NEXT_PUBLIC_FIREBASE_EMULATORS) {
   // Project: CareerFairyStreaming
   appID = "52e732c40bf94a8c97fdd0fd443210e0"

   console.log("Using AgoraSDK testing environment")
}

export const agoraCredentials = {
   appID,
}

/**
 * Initializes a Web SDK client and stores the instance for the lifecycle of the application
 * @param config Configuration for the Web SDK Client instance
 * @returns React hook that gives access to the Web SDK Client instance
 * @category Wrapper
 */
export const createClient = (config: ClientConfig) => {
   let client: IAgoraRTCClient
   function createClosure() {
      if (!client) {
         client = AgoraRTC.createClient(config)
      }
      return client
   }
   return () => createClosure()
}
