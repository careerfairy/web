import AgoraRTC, { ClientConfig, IAgoraRTCClient } from "agora-rtc-sdk-ng"
import VirtualBackgroundExtension from "agora-extension-virtual-background"

// Single instance for the whole app, registered into AgoraRTC
export const agoraVirtualBackgroundExtension: VirtualBackgroundExtension =
   new VirtualBackgroundExtension()
AgoraRTC.registerExtensions([agoraVirtualBackgroundExtension])

export class AgoraService {
   constructor() {}

   /**
    * Initializes a Web SDK client and stores the instance for the lifecycle of the application
    * @param config Configuration for the Web SDK Client instance
    * @returns React hook that gives access to the Web SDK Client instance
    * @category Wrapper
    */
   createClient(config: ClientConfig) {
      let client: IAgoraRTCClient

      function createClosure() {
         if (!client) {
            client = AgoraRTC.createClient(config)
         }
         return client
      }

      return () => createClosure()
   }
}

export const agoraServiceInstance = new AgoraService()

export default AgoraService
