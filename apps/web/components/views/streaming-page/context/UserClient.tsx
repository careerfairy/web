import AgoraRTC, {
   AgoraRTCProvider,
   AgoraRTCScreenShareProvider,
} from "agora-rtc-react"
import { ReactNode, useEffect, useMemo } from "react"
import {
   agoraNoiseSuppression,
   agoraVirtualBackgroundExtension,
} from "../config/agoraExtensions"

type Props = {
   children: ReactNode
}

type Extension = Parameters<typeof AgoraRTC.registerExtensions>[0][number]

const registerExtensions = () => {
   const extensions: Extension[] = [agoraVirtualBackgroundExtension]

   if (agoraNoiseSuppression.checkCompatibility()) {
      extensions.push(agoraNoiseSuppression)
   }

   AgoraRTC.registerExtensions(extensions)
}

registerExtensions()

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
