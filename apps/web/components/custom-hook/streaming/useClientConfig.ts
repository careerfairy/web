import {
   useIsConnected,
   type ClientRole,
   type IAgoraRTCClient,
} from "agora-rtc-react"
import { useEffect, useState } from "react"
import { useAsync } from "react-use"
import { errorLogAndNotify } from "util/CommonUtil"

type Options = {
   hostCondition: boolean
}

export const useClientConfig = (client: IAgoraRTCClient, options: Options) => {
   // Default role is always audience according to SDK
   const [currentRole, setCurrentRole] = useState<ClientRole>("audience")
   const isConnected = useIsConnected(client)

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
