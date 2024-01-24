import dynamic from "next/dynamic"
import { useMountedState } from "react-use"

const StreamingPage = dynamic(
   // Use next/dynamic to import the StreamingPage component without ssr as the Agora SDK uses the window object
   // https://github.com/AgoraIO-Community/Agora-RTC-React/blob/master/example/nextjs/pages/index.tsx
   import("components/views/streaming-page").then((a) => a.StreamingPage),
   { ssr: false }
)

const StreamingViewer = () => {
   const mounted = useMountedState()

   return mounted() ? <StreamingPage isHost={false} /> : null
}

export default StreamingViewer
