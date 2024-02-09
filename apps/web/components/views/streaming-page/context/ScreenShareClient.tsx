import AgoraRTC, { AgoraRTCScreenShareProvider } from "agora-rtc-react"
import { ReactNode } from "react"

type Props = {
   children: ReactNode
}

const client = AgoraRTC.createClient({
   mode: "live",
   codec: "vp8",
})

export const ScreenShareClientProvider = ({ children }: Props) => {
   return (
      <AgoraRTCScreenShareProvider client={client}>
         {children}
      </AgoraRTCScreenShareProvider>
   )
}
