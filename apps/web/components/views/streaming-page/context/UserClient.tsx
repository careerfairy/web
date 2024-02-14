import { useState, useEffect, ReactNode, useRef } from "react"
import type { ClientConfig, IAgoraRTCClient } from "agora-rtc-react"
import dynamic from "next/dynamic"
import { getAgoraRTC } from "../util"

// Prevents nextjs Build/Dev error
const AgoraRTCProviderPrimitive = dynamic(
   () => import("agora-rtc-react").then((mod) => mod.AgoraRTCProvider),
   {
      ssr: false,
   }
)

export const UserClientProvider = (props: { children: ReactNode }) => {
   const clientConfigRef = useRef<ClientConfig>({ mode: "live", codec: "vp8" })
   const [client, setClient] = useState<IAgoraRTCClient>()

   useEffect(() => {
      const initSdk = async () => {
         const AgoraRTC = await getAgoraRTC()
         setClient(AgoraRTC.createClient(clientConfigRef.current))
      }
      initSdk()
   }, [])

   return (
      client && (
         <AgoraRTCProviderPrimitive client={client}>
            {props.children}
         </AgoraRTCProviderPrimitive>
      )
   )
}
