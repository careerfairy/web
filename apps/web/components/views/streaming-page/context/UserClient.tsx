import AgoraRTC, {
   AgoraRTCProvider,
   AgoraRTCScreenShareProvider,
} from "agora-rtc-react"
import { agoraVirtualBackgroundExtension } from "data/agora/AgoraService"
import { ReactNode, useEffect, useMemo } from "react"

type Props = {
   children: ReactNode
}

AgoraRTC.registerExtensions([agoraVirtualBackgroundExtension])

export const UserClientProvider = ({ children }: Props) => {
   const client = useMemo(
      () =>
         AgoraRTC.createClient({
            mode: "live",
            codec: "vp8",
         }),
      []
   )

   const screenShareClient = useMemo(
      () =>
         AgoraRTC.createClient({
            mode: "live",
            codec: "vp8",
         }),
      []
   )

   useEffect(() => {
      screenShareClient.disableDualStream()
   }, [screenShareClient])

   return (
      <AgoraRTCProvider client={client}>
         <AgoraRTCScreenShareProvider client={screenShareClient}>
            {children}
         </AgoraRTCScreenShareProvider>
      </AgoraRTCProvider>
   )
}
