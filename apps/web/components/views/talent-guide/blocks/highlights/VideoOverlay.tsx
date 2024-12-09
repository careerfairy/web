import { Box } from "@mui/material"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   videoOverlay: {
      width: "100%",
      height: "100%",
      background:
         "linear-gradient(180deg, rgba(0, 0, 0, 0) 78.12%, rgba(0, 0, 0, 0.6) 100%), linear-gradient(180deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0) 17.71%)",
      position: "absolute",
      top: 0,
      left: 0,
      zIndex: 1,
   },
})

export const HighlightVideoOverlay = () => {
   return <Box sx={styles.videoOverlay} key="video-overlay" />
}
