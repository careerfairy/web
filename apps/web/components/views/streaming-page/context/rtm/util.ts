import AgoraRTM, { RtmChannel, RtmClient } from "agora-rtm-sdk"

/**
 * Returns a hook to access an RTM client, use this outside your React component.
 * The returned hook gives the same client throughout the application lifecycle.
 * @param appId Agora AppID
 * @returns React Hook to access client object
 */
export const createRTMClient = (appId: string) => {
   let client: RtmClient
   /**
    * A React Hook to access the RTM Client
    * @returns RTM Client
    */
   function createClosure() {
      if (!client) {
         client = AgoraRTM.createInstance(appId)
      }
      return client
   }
   return () => createClosure()
}

/**
 * Returns a hook to access an RTM channel instance, use this outside your React component.
 * The returned hook accepts the channel config on the first hook call and gives the same channel instance throughout the application lifecycle.
 * Use this when you need to create a client but the config is only available during the application runtime, don't update the config between re-renders.
 * @returns A React Hook to access the RTM channel instance
 */
export const createLazyRTMChannel = () => {
   let channel: RtmChannel
   function createClosure(client: RtmClient, channelId: string) {
      if (!channel) {
         channel = client.createChannel(channelId)
      }
      return channel
   }
   return (client: RtmClient, channelId: string) =>
      createClosure(client, channelId)
}
