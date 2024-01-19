import { useAuth } from "HOCs/AuthProvider"
import { StreamingPage } from "components/views/streaming-page"

const StreamingHost = () => {
   const { userData } = useAuth()

   return userData?.isAdmin ? <StreamingPage isHost /> : null
}

export default StreamingHost
