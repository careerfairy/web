import AgoraRTC, {
   AgoraRTCProvider,
   AgoraRTCScreenShareProvider,
} from "agora-rtc-react"
import { ReactNode, useMemo } from "react"

type Props = {
   children: ReactNode
}

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

   return (
      <AgoraRTCProvider client={client}>
         <AgoraRTCScreenShareProvider client={screenShareClient}>
            {children}
         </AgoraRTCScreenShareProvider>
      </AgoraRTCProvider>
   )
}
