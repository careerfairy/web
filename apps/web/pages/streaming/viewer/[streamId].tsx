import { useAuth } from "HOCs/AuthProvider"
import { StreamingPage } from "components/views/streaming-page"

const StreamingViewer = () => {
   const { userData } = useAuth()

   return userData.isAdmin ? <StreamingPage /> : null
}

export default StreamingViewer
