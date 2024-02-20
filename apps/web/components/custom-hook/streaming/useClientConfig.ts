import {
   useIsConnected,
   type ClientRole,
   type IAgoraRTCClient,
} from "agora-rtc-react"
import { useEffect, useState } from "react"
import { errorLogAndNotify } from "util/CommonUtil"

type Options = {
   hostCondition: boolean
}

export const useClientConfig = (client: IAgoraRTCClient, options: Options) => {
   // Default role is always audience according to SDK
   const [currentRole, setCurrentRole] = useState<ClientRole>("audience")
   const isConnected = useIsConnected(client)

   useEffect(() => {
      if (isConnected) {
         const newRole = options.hostCondition ? "host" : "audience"
         client
            .setClientRole(newRole)
            .then(() => setCurrentRole(newRole))
            .catch(errorLogAndNotify)
      }
   }, [client, isConnected, options.hostCondition])

   useEffect(() => {
      client.enableDualStream().catch(errorLogAndNotify)
   }, [client])

   useEffect(() => {
      if (isConnected) {
         client.enableAudioVolumeIndicator()
      }
   }, [client, isConnected])

   return {
      currentRole,
   }
}
