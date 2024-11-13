import {
   useIsConnected,
   type ClientRole,
   type IAgoraRTCClient,
} from "agora-rtc-react"
import { useEffect, useState } from "react"
import { useAsync } from "react-use"
import { errorLogAndNotify } from "util/CommonUtil"
import { useForcedProxyMode } from "./useForcedProxyMode"

type Options = {
   hostCondition: boolean
   enableDualStream?: boolean
}

export const useClientConfig = (client: IAgoraRTCClient, options: Options) => {
   // Default role is always audience according to SDK
   const [currentRole, setCurrentRole] = useState<ClientRole>("audience")
   const isConnected = useIsConnected(client)
   const forcedProxyMode = useForcedProxyMode()

   useEffect(() => {
      if (forcedProxyMode) {
         client.startProxyServer(forcedProxyMode)
      }
   }, [client, forcedProxyMode])

   useAsync(async () => {
      if (isConnected) {
         const newRole = options.hostCondition ? "host" : "audience"
         try {
            if (newRole === "audience") {
               await client.unpublish()
            }
            await client.setClientRole(newRole)
            setCurrentRole(newRole)
         } catch (err) {
            errorLogAndNotify(err, {
               message: "Failed to set client role",
               newRole,
            })
         }
      }
   }, [client, isConnected, options.hostCondition])

   useEffect(() => {
      if (options.enableDualStream) {
         client.enableDualStream().catch(errorLogAndNotify)
      }
   }, [client, currentRole, options.enableDualStream])

   useEffect(() => {
      if (isConnected) {
         client.enableAudioVolumeIndicator()
      }
   }, [client, isConnected])

   return {
      currentRole,
   }
}
