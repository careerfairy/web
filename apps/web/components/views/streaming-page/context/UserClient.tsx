import AgoraRTC, { AgoraRTCProvider } from "agora-rtc-react"
import { ReactNode } from "react"

type Props = {
   children: ReactNode
}

const client = AgoraRTC.createClient({
   mode: "live",
   codec: "vp8",
})

export const UserClientProvider = ({ children }: Props) => {
   return <AgoraRTCProvider client={client}>{children}</AgoraRTCProvider>
}
