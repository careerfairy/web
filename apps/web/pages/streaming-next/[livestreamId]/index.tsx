import AgoraRTC from "agora-rtc-sdk-ng"
import StreamingLayout from "components/views/streaming-next/layout"
import React, { FC } from "react"

type Props = {}
const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" })

const Viewer: FC<Props> = ({}) => {
   return <StreamingLayout>Host</StreamingLayout>
}

export default Viewer
