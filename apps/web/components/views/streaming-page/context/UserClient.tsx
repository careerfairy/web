import type { ClientConfig } from "agora-rtc-react"
import AgoraRTC, { AgoraRTCProvider } from "agora-rtc-react"
import type { ReactNode } from "react"

interface ClientProps {
   children: ReactNode
   clientConfig?: ClientConfig
}

const config: ClientConfig = {
   mode: "live",
   codec: "vp8",
}

const client = AgoraRTC.createClient(config)

export const UserClientProvider = ({ children }: ClientProps) => {
   return <AgoraRTCProvider client={client}>{children}</AgoraRTCProvider>
}
