import { Typography } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import { StreamingPage } from "components/views/streaming-page"

const StreamingViewer = () => {
   const { userData } = useAuth()

   return userData?.isAdmin ? (
      <StreamingPage isHost={false} />
   ) : (
      <Typography variant="brandedH4" color="error">
         Please log in as cf admin to access this page
      </Typography>
   )
}

export default StreamingViewer
