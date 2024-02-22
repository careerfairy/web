import { Box } from "@mui/material"
import { UserStreamComponent } from "../gallery/UserStreamComponent"
import { useSpotlight } from "./SpotlightProvider"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      width: "100%",
      height: "100%",
   },
   userStream: {
      width: "100%",
      height: "100%",
   },
})

export const SpotlightStream = () => {
   const { stream } = useSpotlight()

   if (!stream) {
      return <Box>Please wait while the host is setting up the stream</Box>
   }

   return (
      <Box sx={styles.root}>
         <Box sx={styles.userStream}>
            <UserStreamComponent user={stream} />
         </Box>
      </Box>
   )
}
