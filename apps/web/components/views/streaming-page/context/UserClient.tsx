import AgoraRTC, {
   AgoraRTCProvider,
   AgoraRTCScreenShareProvider,
} from "agora-rtc-react"
import { ReactNode } from "react"

type Props = {
   children: ReactNode
}

const client = AgoraRTC.createClient({
   mode: "live",
   codec: "vp8",
})
const screenShareClient = AgoraRTC.createClient({
   mode: "live",
   codec: "vp8",
})

export const UserClientProvider = ({ children }: Props) => {
   return (
      <AgoraRTCProvider client={client}>
         <AgoraRTCScreenShareProvider client={screenShareClient}>
            {children}
         </AgoraRTCScreenShareProvider>
      </AgoraRTCProvider>
   )
}
