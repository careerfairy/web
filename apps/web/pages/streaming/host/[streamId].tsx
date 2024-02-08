import { GetServerSideProps } from "next"
import dynamic from "next/dynamic"
import { useEffect, useState } from "react"

const StreamingPage = dynamic(
   // Use next/dynamic to import the StreamingPage component without ssr as the Agora SDK uses the window object
   // https://github.com/AgoraIO-Community/Agora-RTC-React/blob/master/example/nextjs/pages/index.tsx
   import("components/views/streaming-page").then((a) => a.StreamingPage),
   { ssr: false }
)

const StreamingHost = () => {
   const [loaded, setLoaded] = useState(false)
   useEffect(() => {
      setLoaded(true)
   }, [])

   return loaded ? <StreamingPage isHost /> : null
}
/**
 * Force the page to be initially rendered on the server
 *
 * This is required to allow the _document.tsx to access the correct request
 * context data (query string params) and disable Usercentrics for certain scenarios
 * like the recording session
 */
export const getServerSideProps: GetServerSideProps = async () => {
   return { props: {} }
}
export default StreamingHost
